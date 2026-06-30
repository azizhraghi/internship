import asyncio
from celery import shared_task
from shared.database import get_db
from agents.veille.agent import veille_agent

@shared_task(name="veille.run_collection")
def run_veille_collection_task():
    """Celery task to run the veille collection process."""
    
    async def _run():
        # get_db is an async generator
        async for db in get_db():
            await veille_agent.run_collection(db)
            break
            
    asyncio.run(_run())
