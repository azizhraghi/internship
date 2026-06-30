import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from agents.veille.models import Article
from shared.llm_client import llm_client

def cosine_distance(v1: list[float], v2: list[float]) -> float:
    if not v1 or not v2:
        return 1.0
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(b * b for b in v2))
    if not mag1 or not mag2:
        return 1.0
    return 1.0 - (dot / (mag1 * mag2))

async def generate_embedding(text: str) -> list[float]:
    """Generate an embedding for the given text using Mistral."""
    try:
        embeddings = await llm_client.generate_embeddings([text])
        return embeddings[0] if embeddings else []
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return []

async def is_duplicate(db: AsyncSession, embedding: list[float], threshold: float = 0.1) -> bool:
    """Check if a similar article exists using in-memory cosine distance."""
    if not embedding:
        return False
        
    stmt = select(Article.id, Article.embedding).where(Article.embedding.is_not(None))
    result = await db.execute(stmt)
    
    for row in result:
        article_id, db_embedding = row
        if db_embedding and cosine_distance(embedding, db_embedding) < threshold:
            return True
            
    return False
