import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from shared.database import Base

class Source(Base):
    __tablename__ = "veille_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # rss, api, etc.
    url = Column(String)
    config = Column(JSON, nullable=True)
    active = Column(Boolean, default=True)
    last_scraped = Column(DateTime, nullable=True)

    articles = relationship("Article", back_populates="source")

class Article(Base):
    __tablename__ = "veille_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    abstract = Column(Text, nullable=True)
    authors = Column(JSON, nullable=True)  # List of authors
    doi = Column(String, unique=True, index=True, nullable=True)
    url = Column(String, nullable=True)
    source_id = Column(Integer, ForeignKey("veille_sources.id"))
    published_at = Column(DateTime, nullable=True)
    embedding = Column(JSON, nullable=True)  # Stored as JSON instead of Vector
    collected_at = Column(DateTime, default=datetime.datetime.utcnow)

    source = relationship("Source", back_populates="articles")
    tags = relationship("ArticleTag", back_populates="article", cascade="all, delete-orphan")
    summaries = relationship("ArticleSummary", back_populates="article", cascade="all, delete-orphan")
    notifications = relationship("AlertNotification", back_populates="article")

class ArticleTag(Base):
    __tablename__ = "veille_article_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("veille_articles.id"))
    tag = Column(String, index=True)
    confidence = Column(Float, nullable=True)

    article = relationship("Article", back_populates="tags")

class ArticleSummary(Base):
    __tablename__ = "veille_article_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("veille_articles.id"))
    language = Column(String(10)) # en, fr
    summary_text = Column(Text)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    article = relationship("Article", back_populates="summaries")

class AlertRule(Base):
    __tablename__ = "veille_alert_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # ID from the auth system
    keywords = Column(JSON, nullable=True)
    themes = Column(JSON, nullable=True)
    frequency = Column(String) # daily, weekly, immediate
    
    notifications = relationship("AlertNotification", back_populates="rule")

class AlertNotification(Base):
    __tablename__ = "veille_alert_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("veille_alert_rules.id"))
    article_id = Column(Integer, ForeignKey("veille_articles.id"))
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    channel = Column(String) # email, in_app

    rule = relationship("AlertRule", back_populates="notifications")
    article = relationship("Article", back_populates="notifications")
