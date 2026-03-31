from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

# All routes in this router are prefixed with /checklist
router = APIRouter(prefix="/checklist", tags=["Checklist"])


@router.get("/", response_model=list[schemas.ChecklistItemResponse])
def get_checklist(db: Session = Depends(get_db)):
    # Fetch and return all checklist items from the database
    return db.query(models.ChecklistItem).all()


@router.post("/", response_model=schemas.ChecklistItemResponse)
def create_item(item: schemas.ChecklistItemCreate, db: Session = Depends(get_db)):
    # Convert Pydantic schema to ORM model and persist to the database
    new_item = models.ChecklistItem(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)  # Reload to get DB-generated fields (e.g. id)
    return new_item


@router.patch("/{item_id}/complete", response_model=schemas.ChecklistItemResponse)
def toggle_complete(item_id: int, db: Session = Depends(get_db)):
    # Look up the item by its primary key
    item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id).first()

    # Return 404 if no item exists with the given id
    if not item:
        raise HTTPException(status_code=404, detail=f"Checklist item {item_id} not found")

    # Flip the completed flag and save
    item.completed = not item.completed
    db.commit()
    db.refresh(item)
    return item
