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

class DealResponse(BaseModel):
    id: int
    title: str
    provider: str
    description: str | None = None
    category: str
    savings: str | None = None
    how_to_claim: str | None = None
    link: str | None = None
    icon: str | None = None
    sort_order: int

    class Config:
        from_attributes = True


# --- Budget ---

class BudgetEntryCreate(BaseModel):
    label: str
    amount: float
    entry_type: str  # "income" or "expense"
    category: str = "other"

class BudgetEntryResponse(BudgetEntryCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetLimitSet(BaseModel):
    category: str
    amount: float

class BudgetLimitResponse(BudgetLimitSet):
    id: int
    user_id: int

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


# --- OTP ---

class OTPRequest(BaseModel):
    email: str
    purpose: str = "register"  # "register" or "login"

class OTPVerify(BaseModel):
    email: str
    code: str

class OTPVerifyResponse(BaseModel):
    verified: bool
    otp_token: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginWithOTP(BaseModel):
    email: str
    password: str
    otp_code: str

class ResetPassword(BaseModel):
    email: str
    otp_token: str
    new_password: str


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
