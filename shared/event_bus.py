import json
import redis.asyncio as redis
from typing import Callable, Any, Awaitable
from shared.config import settings
from shared.schemas import Event

class EventBus:
    def __init__(self):
        self.redis_client = redis.from_url(settings.redis_url, decode_responses=True)
    
    async def publish(self, stream_name: str, event: Event) -> str:
        """Publish an event to a Redis stream."""
        event_dict = event.model_dump(mode='json')
        # Redis streams require dict with string keys and string values
        payload = {"data": json.dumps(event_dict)}
        message_id = await self.redis_client.xadd(stream_name, payload)
        return message_id

    async def subscribe(self, stream_name: str, group_name: str, consumer_name: str, callback: Callable[[Event], Awaitable[None]]):
        """Subscribe to a Redis stream using a consumer group."""
        try:
            # Create consumer group, $ means only new messages
            await self.redis_client.xgroup_create(stream_name, group_name, id="$", mkstream=True)
        except redis.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise
        
        while True:
            try:
                # Read from stream. > means read messages not delivered to other consumers in group
                messages = await self.redis_client.xreadgroup(
                    groupname=group_name,
                    consumername=consumer_name,
                    streams={stream_name: ">"},
                    count=1,
                    block=5000
                )
                
                for stream, msgs in messages:
                    for message_id, message_data in msgs:
                        raw_data = message_data.get("data")
                        if raw_data:
                            event_data = json.loads(raw_data)
                            event = Event(**event_data)
                            await callback(event)
                            # Acknowledge the message
                            await self.redis_client.xack(stream_name, group_name, message_id)
            except Exception as e:
                # Log error and continue
                print(f"Error processing stream {stream_name}: {e}")

event_bus = EventBus()
