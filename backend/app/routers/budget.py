from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.get("/", response_model=list[schemas.BudgetEntryResponse])
def get_entries(
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.BudgetEntry)
        .filter(models.BudgetEntry.user_id == current_user.id)
        .order_by(models.BudgetEntry.created_at.desc())
        .all()
    )


@router.post("/", response_model=schemas.BudgetEntryResponse)
def create_entry(
    entry: schemas.BudgetEntryCreate,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_entry = models.BudgetEntry(
        user_id=current_user.id,
        **entry.model_dump(),
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(models.BudgetEntry).filter(models.BudgetEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Budget entry not found")
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your entry")
    db.delete(entry)
    db.commit()
    return {"ok": True}


# ── Budget Limits ──────────────────────────────────────────────────────────

@router.get("/limits", response_model=list[schemas.BudgetLimitResponse])
def get_limits(
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.BudgetLimit)
        .filter(models.BudgetLimit.user_id == current_user.id)
        .all()
    )


@router.put("/limits", response_model=schemas.BudgetLimitResponse)
def set_limit(
    body: schemas.BudgetLimitSet,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(models.BudgetLimit)
        .filter(
            models.BudgetLimit.user_id == current_user.id,
            models.BudgetLimit.category == body.category,
        )
        .first()
    )
    if existing:
        existing.amount = body.amount
    else:
        existing = models.BudgetLimit(
            user_id=current_user.id,
            category=body.category,
            amount=body.amount,
        )
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/limits/{category}")
def delete_limit(
    category: str,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    limit = (
        db.query(models.BudgetLimit)
        .filter(
            models.BudgetLimit.user_id == current_user.id,
            models.BudgetLimit.category == category,
        )
        .first()
    )
    if not limit:
        raise HTTPException(status_code=404, detail="Limit not found")
    db.delete(limit)
    db.commit()
    return {"ok": True}
