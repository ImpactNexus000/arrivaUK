from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

# All routes in this router are prefixed with /deals
router = APIRouter(prefix="/deals", tags=["Deals"])


@router.get("/", response_model=list[schemas.DealResponse])
def get_deals(db: Session = Depends(get_db)):
    # Fetch and return all deals from the database
    return db.query(models.Deal).all()


@router.post("/", response_model=schemas.DealResponse)
def create_deal(deal: schemas.DealCreate, db: Session = Depends(get_db)):
    # Convert Pydantic schema to ORM model and persist to the database
    new_deal = models.Deal(**deal.model_dump())
    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)  # Reload to get DB-generated fields (e.g. id)
    return new_deal
