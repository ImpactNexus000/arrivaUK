from pydantic import BaseModel
from datetime import datetime


# --- Checklist ---

class ChecklistItemBase(BaseModel):
    title: str
    description: str | None = None

class ChecklistItemCreate(ChecklistItemBase):
    pass

class ChecklistItemResponse(ChecklistItemBase):
    id: int
    completed: bool

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
    author_name: str
    content: str

class PostReplyResponse(PostReplyCreate):
    id: int
    post_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CommunityPostCreate(BaseModel):
    author_name: str
    content: str
    category: str

class CommunityPostResponse(CommunityPostCreate):
    id: int
    likes_count: int
    created_at: datetime
    replies: list[PostReplyResponse] = []

    class Config:
        from_attributes = True
