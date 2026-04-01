from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=schemas.UserProfileResponse)
def create_user(user: schemas.UserProfileCreate, db: Session = Depends(get_db)):
    new_user = models.UserProfile(**user.model_dump())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/{user_id}", response_model=schemas.UserProfileResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.UserProfile).filter(models.UserProfile.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
