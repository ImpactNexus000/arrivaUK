from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    completed = Column(Boolean, default=False)


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    category = Column(String)
    link = Column(String)


class BudgetEntry(Base):
    __tablename__ = "budget_entries"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    entry_type = Column(String, nullable=False)  # "income" or "expense"


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    student_type = Column(String, nullable=False)  # "international", "eu_eea", "uk_home"
    university = Column(String, nullable=False)
    arrival_status = Column(String, nullable=False)  # "not_arrived", "just_arrived", "been_here"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    author_name = Column(String, nullable=False)
    content = Column(String, nullable=False)
    category = Column(String, nullable=False)  # "banks", "ni_number", "shopping", "housing", "transport", "general"
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    replies = relationship("PostReply", back_populates="post", order_by="PostReply.created_at")


class PostReply(Base):
    __tablename__ = "post_replies"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    author_name = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    post = relationship("CommunityPost", back_populates="replies")
