from abc import ABC, abstractmethod
from typing import List, Dict, Any
import asyncio
from shared.schemas import Event, AgentAction, ActionResult, AuditEntry
from shared.event_bus import event_bus
from shared.database import get_db

class BaseAgent(ABC):
    name: str = "base_agent"
    permissions: List[str] = []
    requires_human_approval: List[str] = []
    
    def __init__(self):
        self.running = False
        
    async def start(self):
        """Start the agent and its background tasks/subscriptions."""
        self.running = True
        print(f"[{self.name}] Agent started.")
        await self._setup_subscriptions()
        
    async def stop(self):
        """Stop the agent."""
        self.running = False
        print(f"[{self.name}] Agent stopped.")
        
    @abstractmethod
    async def _setup_subscriptions(self):
        """Setup event bus subscriptions."""
        pass
        
    @abstractmethod
    async def handle_event(self, event: Event) -> Optional[AgentAction]:
        """Handle an incoming event and optionally propose an action."""
        pass
        
    async def propose_action(self, action: AgentAction) -> None:
        """Send an action to the orchestrator/review queue."""
        # Check if action needs approval
        if action.action_type in self.requires_human_approval:
            # Emit an event for the orchestrator to pick up and add to review queue
            review_event = Event(
                id=f"review_{action.id}",
                type="orch.action_proposed",
                source_agent=self.name,
                payload={"action": action.model_dump(mode='json')}
            )
            await self.emit_event("orchestrator_stream", review_event)
        else:
            # Execute directly
            await self.execute_action(action)
            
    @abstractmethod
    async def execute_action(self, action: AgentAction) -> ActionResult:
        """Execute an approved action."""
        pass
        
    async def emit_event(self, stream_name: str, event: Event) -> None:
        """Emit an event to the bus."""
        await event_bus.publish(stream_name, event)
        
    async def log_audit(self, entry: AuditEntry) -> None:
        """Log an audit entry."""
        # Typically this would save to DB and/or emit an audit event
        audit_event = Event(
            id=f"audit_{entry.timestamp.timestamp()}",
            type="qual.audit_log",
            source_agent=self.name,
            payload=entry.model_dump(mode='json')
        )
        await self.emit_event("audit_stream", audit_event)
