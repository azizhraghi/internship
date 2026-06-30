from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from shared.base_agent import BaseAgent
from shared.schemas import Event, AgentAction, ActionResult
from agents.veille.models import Source, Article, ArticleTag, ArticleSummary
from agents.veille.services.scraper import fetch_rss_feed
from agents.veille.services.deduplicator import generate_embedding, is_duplicate
from agents.veille.services.tagger import tag_article
from agents.veille.services.summarizer import summarize_article
import datetime

class VeilleAgent(BaseAgent):
    name = "veille"
    permissions = ["veille.read", "veille.write"]
    requires_human_approval = []

    async def _setup_subscriptions(self):
        """Subscribe to relevant event streams."""
        # Will subscribe to orchestrator commands later
        pass

    async def handle_event(self, event: Event) -> Optional[AgentAction]:
        """Handle incoming events — e.g. a manual trigger from the orchestrator."""
        return None

    async def execute_action(self, action: AgentAction) -> ActionResult:
        """Execute an approved action."""
        return ActionResult(
            action_id=action.id,
            status="completed",
            result_data={"message": "Action executed by VeilleAgent"}
        )

    async def run_collection(self, db: AsyncSession):
        """Execute a collection run across all active sources."""
        # 1. Fetch active sources
        stmt = select(Source).where(Source.active == True)
        result = await db.execute(stmt)
        sources = result.scalars().all()

        for source in sources:
            if source.type in ("rss", "atom"):
                articles_data = await fetch_rss_feed(source.url)
                
                for item in articles_data:
                    text_for_embed = f"{item['title']} {item['abstract'] or ''}"
                    
                    # 2. Check deduplication
                    embedding = await generate_embedding(text_for_embed)
                    if not embedding:
                        continue
                        
                    is_dup = await is_duplicate(db, embedding, threshold=0.1)
                    if is_dup:
                        continue # Skip duplicate
                        
                    # 3. Create Article
                    article = Article(
                        title=item['title'],
                        abstract=item['abstract'],
                        url=item['url'],
                        source_id=source.id,
                        published_at=item['published_at'],
                        embedding=embedding
                    )
                    db.add(article)
                    await db.flush() # flush to get article.id
                    
                    # 4. Tagging
                    tags = await tag_article(item['title'], item['abstract'] or "")
                    for tag_info in tags:
                        db.add(ArticleTag(
                            article_id=article.id,
                            tag=tag_info.get("tag", "Unknown"),
                            confidence=tag_info.get("confidence")
                        ))
                    
                    # 5. Summarization (French & English)
                    for lang in ["fr", "en"]:
                        summary = await summarize_article(item['title'], item['abstract'] or "", language=lang)
                        if summary:
                            db.add(ArticleSummary(
                                article_id=article.id,
                                language=lang,
                                summary_text=summary
                            ))
                            
                source.last_scraped = datetime.datetime.utcnow()
                
        await db.commit()

veille_agent = VeilleAgent()
