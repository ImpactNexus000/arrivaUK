from pydantic import BaseModel
from datetime import datetime


# --- Checklist ---

class ChecklistItemBase(BaseModel):
    title: str
    description: str | None = None

class ChecklistItemCreate(ChecklistItemBase):
    category: str = "essentials"
    urgency: str = "first_week"
    icon: str | None = None

class ChecklistItemResponse(ChecklistItemBase):
    id: int
    user_id: int
    completed: bool
    category: str
    urgency: str
    icon: str | None = None
    is_default: bool
    sort_order: int

    class Config:
        from_attributes = True


# --- Documents ---

class DocumentCreate(BaseModel):
    title: str
    description: str | None = None
    category: str = "other"
    tip: str | None = None
    icon: str | None = None

class DocumentUpdateStatus(BaseModel):
    status: str  # "not_started", "in_progress", "ready"

class DocumentResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None = None
    category: str
    status: str
    icon: str | None = None
    tip: str | None = None
    is_default: bool
    sort_order: int

    class Config:
        from_attributes = True


# --- Deals ---

class DealBase(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    link: str | None = None

class DealCreate(DealBase):
    pass

class DealResponse(DealBase):
    id: int

    class Config:
        from_attributes = True


# --- Budget ---

class BudgetEntryBase(BaseModel):
    label: str
    amount: float
    entry_type: str  # "income" or "expense"

class BudgetEntryCreate(BudgetEntryBase):
    pass

class BudgetEntryResponse(BudgetEntryBase):
    id: int

    class Config:
        from_attributes = True


# --- User Profile / Auth ---

class UserProfileCreate(BaseModel):
    name: str
    student_type: str  # "international", "eu_eea", "uk_home"
    university: str
    arrival_status: str  # "not_arrived", "just_arrived", "been_here"

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileResponse(BaseModel):
    id: int
    email: str
    name: str
    student_type: str
    university: str
    arrival_status: str
    profile_picture: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


# --- Community ---

class PostReplyCreate(BaseModel):
    content: str

class PostReplyResponse(PostReplyCreate):
    id: int
    post_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CommunityPostCreate(BaseModel):
    content: str
    category: str

class CommunityPostUpdate(BaseModel):
    content: str | None = None
    category: str | None = None

class CommunityPostResponse(BaseModel):
    id: int
    user_id: int | None = None
    author_name: str
    content: str
    category: str
    likes_count: int
    created_at: datetime
    replies: list[PostReplyResponse] = []

    class Config:
        from_attributes = True
