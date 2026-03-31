from pydantic import BaseModel


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
