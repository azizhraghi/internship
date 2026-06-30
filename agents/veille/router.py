from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from shared.database import get_db
from shared.security import get_current_user, User
from agents.veille.models import Article, Source, AlertRule
from agents.veille.schemas import ArticleResponse, SourceResponse, SourceCreate, AlertRuleResponse, AlertRuleCreate
from agents.veille.tasks import run_veille_collection_task

router = APIRouter()

@router.get("/articles", response_model=List[ArticleResponse])
async def list_articles(db: AsyncSession = Depends(get_db)):
    stmt = select(Article).options(
        selectinload(Article.tags), 
        selectinload(Article.summaries)
    ).order_by(Article.published_at.desc()).limit(50)
    
    result = await db.execute(stmt)
    articles = result.scalars().all()
    return articles

@router.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Article).options(
        selectinload(Article.tags), 
        selectinload(Article.summaries)
    ).where(Article.id == article_id)
    
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("/sources", response_model=SourceResponse)
async def add_source(source: SourceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_source = Source(**source.model_dump())
    db.add(db_source)
    await db.commit()
    await db.refresh(db_source)
    return db_source

@router.post("/trigger")
async def trigger_collection(current_user: User = Depends(get_current_user)):
    run_veille_collection_task.delay()
    return {"status": "Collection triggered in background"}

@router.get("/alerts", response_model=List[AlertRuleResponse])
async def list_alerts(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(AlertRule).where(AlertRule.user_id == current_user.username)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/alerts", response_model=AlertRuleResponse)
async def create_alert(alert: AlertRuleCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_alert = AlertRule(**alert.model_dump(), user_id=current_user.username)
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)
    return db_alert
