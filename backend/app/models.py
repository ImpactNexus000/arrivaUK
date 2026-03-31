from sqlalchemy import Column, Integer, String, Boolean, Float
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
