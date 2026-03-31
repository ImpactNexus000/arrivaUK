from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

# All routes in this router are prefixed with /budget
router = APIRouter(prefix="/budget", tags=["Budget"])


@router.get("/", response_model=list[schemas.BudgetEntryResponse])
def get_entries(db: Session = Depends(get_db)):
    # Fetch and return all budget entries from the database
    return db.query(models.BudgetEntry).all()


@router.post("/", response_model=schemas.BudgetEntryResponse)
def create_entry(entry: schemas.BudgetEntryCreate, db: Session = Depends(get_db)):
    # Convert Pydantic schema to ORM model and persist to the database
    new_entry = models.BudgetEntry(**entry.model_dump())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)  # Reload to get DB-generated fields (e.g. id)
    return new_entry


@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    # Look up the entry by its primary key
    entry = db.query(models.BudgetEntry).filter(models.BudgetEntry.id == entry_id).first()

    # Return 404 if no entry exists with the given id
    if not entry:
        raise HTTPException(status_code=404, detail=f"Budget entry {entry_id} not found")

    # Delete the entry and commit the transaction
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}
