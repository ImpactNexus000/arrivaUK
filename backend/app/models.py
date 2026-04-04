from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    completed = Column(Boolean, default=False)
    category = Column(String, nullable=False, default="essentials")
    urgency = Column(String, nullable=False, default="first_week")
    icon = Column(String, nullable=True)
    is_default = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, nullable=False, default="travel")
    status = Column(String, nullable=False, default="not_started")  # "not_started", "in_progress", "ready"
    icon = Column(String, nullable=True)
    tip = Column(String, nullable=True)
    is_default = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, nullable=False)
    savings = Column(String, nullable=True)
    how_to_claim = Column(String, nullable=True)
    link = Column(String)
    icon = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)


class BudgetEntry(Base):
    __tablename__ = "budget_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=False)
    label = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    entry_type = Column(String, nullable=False)  # "income" or "expense"
    category = Column(String, nullable=False, default="other")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class BudgetLimit(Base):
    __tablename__ = "budget_limits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    student_type = Column(String, nullable=False)  # "international", "eu_eea", "uk_home"
    university = Column(String, nullable=False)
    arrival_status = Column(String, nullable=False)  # "not_arrived", "just_arrived", "been_here"
    profile_picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    purpose = Column(String, nullable=False)  # "register" or "login"
    expires_at = Column(DateTime, nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=True)
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
