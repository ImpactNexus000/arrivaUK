from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/checklist", tags=["Checklist"])

# Default tasks seeded for every new user, grouped by urgency timeline

SEED_TASKS = [
    # First Week
    {"title": "Get a UK SIM Card", "description": "Buy a pay-as-you-go or contract SIM from providers like Three, Voxi, or Giffgaff", "category": "essentials", "urgency": "first_week", "icon": "📱", "sort_order": 1},
    {"title": "Open a UK Bank Account", "description": "Popular student options: Monzo, Revolut, or Starling for quick setup; HSBC, Barclays for traditional", "category": "finance", "urgency": "first_week", "icon": "🏦", "sort_order": 2},
    {"title": "Register with Your University", "description": "Complete enrolment, collect your student ID, and activate your university account", "category": "student_life", "urgency": "first_week", "icon": "🎓", "sort_order": 3},
    {"title": "Collect BRP Card (if applicable)", "description": "Pick up your Biometric Residence Permit from the post office listed on your decision letter", "category": "essentials", "urgency": "first_week", "icon": "🪪", "sort_order": 4},
    {"title": "Set Up Student Email & Portal", "description": "Activate your university email and familiarise yourself with the student portal", "category": "student_life", "urgency": "first_week", "icon": "📧", "sort_order": 5},
    {"title": "Get Bedding & Kitchen Essentials", "description": "Check Primark, IKEA, Wilko, or TK Maxx for affordable bedding, cookware, and basics", "category": "housing", "urgency": "first_week", "icon": "🛏️", "sort_order": 6},

    # First Month
    {"title": "Apply for National Insurance Number", "description": "Call the NI number application line (0800 141 2075) — you'll need this for any paid work in the UK", "category": "finance", "urgency": "first_month", "icon": "🔢", "sort_order": 7},
    {"title": "Register with an NHS GP", "description": "Find your nearest GP surgery and register — it's free and essential for healthcare access", "category": "health", "urgency": "first_month", "icon": "🏥", "sort_order": 8},
    {"title": "Get a 16-25 Railcard", "description": "Save 1/3 on train fares across the UK — costs £30/year, pays for itself in one trip", "category": "transport", "urgency": "first_month", "icon": "🚂", "sort_order": 9},
    {"title": "Get an Oyster / Travel Card", "description": "If in London get an Oyster card; elsewhere check local bus passes and student travel discounts", "category": "transport", "urgency": "first_month", "icon": "🚌", "sort_order": 10},
    {"title": "Set Up a UK Mobile Plan", "description": "Switch from PAYG to a student-friendly monthly plan once you have a bank account", "category": "essentials", "urgency": "first_month", "icon": "📲", "sort_order": 11},
    {"title": "Explore Your Local Area", "description": "Walk around campus, find nearby supermarkets, pharmacies, ATMs, and takeaway spots", "category": "student_life", "urgency": "first_month", "icon": "🗺️", "sort_order": 12},
    {"title": "Join University Societies & Clubs", "description": "Check out your university's Freshers' Fair — great way to meet people and try new things", "category": "student_life", "urgency": "first_month", "icon": "🤝", "sort_order": 13},
    {"title": "Set Up Online Banking", "description": "Download your bank's app, set up notifications, and enable contactless payments on your phone", "category": "finance", "urgency": "first_month", "icon": "💳", "sort_order": 14},

    # When Settled
    {"title": "Apply for a Provisional Driving Licence", "description": "Useful as photo ID even if you don't drive — apply online at GOV.UK for £34", "category": "essentials", "urgency": "when_settled", "icon": "🚗", "sort_order": 15},
    {"title": "Register to Vote (if eligible)", "description": "EU/Commonwealth citizens can register to vote in local elections at gov.uk/register-to-vote", "category": "essentials", "urgency": "when_settled", "icon": "🗳️", "sort_order": 16},
    {"title": "Find Part-Time Work", "description": "Check your university careers portal, Indeed, or student job boards — max 20 hrs/week on student visa", "category": "student_life", "urgency": "when_settled", "icon": "💼", "sort_order": 17},
    {"title": "Get Contents Insurance", "description": "Protect your laptop and belongings — check if your uni accommodation includes basic cover", "category": "housing", "urgency": "when_settled", "icon": "🛡️", "sort_order": 18},
    {"title": "Explore Student Discount Apps", "description": "Sign up for UNiDAYS, Student Beans, and TOTUM (NUS) for discounts at hundreds of stores", "category": "finance", "urgency": "when_settled", "icon": "🏷️", "sort_order": 19},
]


@router.post("/seed", response_model=list[schemas.ChecklistItemResponse])
def seed_checklist(
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # If the user already has default tasks, skip seeding and return existing items
    existing = db.query(models.ChecklistItem).filter(
        models.ChecklistItem.user_id == current_user.id,
        models.ChecklistItem.is_default == True,
    ).first()
    if existing:
        return db.query(models.ChecklistItem).filter(
            models.ChecklistItem.user_id == current_user.id
        ).order_by(models.ChecklistItem.sort_order).all()

    # Create all seed tasks for the user and persist them in one commit
    items = []
    for task in SEED_TASKS:
        item = models.ChecklistItem(user_id=current_user.id, is_default=True, **task)
        db.add(item)
        items.append(item)
    db.commit()
    for item in items:
        db.refresh(item)
    return items


@router.get("/", response_model=list[schemas.ChecklistItemResponse])
def get_checklist(
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.ChecklistItem)
        .filter(models.ChecklistItem.user_id == current_user.id)
        .order_by(models.ChecklistItem.sort_order)
        .all()
    )


@router.post("/", response_model=schemas.ChecklistItemResponse)
def create_item(
    item: schemas.ChecklistItemCreate,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Place the new custom item after the last existing item; default to 100 if none exist
    max_order = (
        db.query(models.ChecklistItem.sort_order)
        .filter(models.ChecklistItem.user_id == current_user.id)
        .order_by(models.ChecklistItem.sort_order.desc())
        .first()
    )
    new_item = models.ChecklistItem(
        user_id=current_user.id,
        is_default=False,
        sort_order=(max_order[0] + 1) if max_order else 100,
        **item.model_dump(),
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.patch("/{item_id}/complete", response_model=schemas.ChecklistItemResponse)
def toggle_complete(
    item_id: int,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Ensure the item belongs to the current user before toggling
    item = db.query(models.ChecklistItem).filter(
        models.ChecklistItem.id == item_id,
        models.ChecklistItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    # Flip the completion state
    item.completed = not item.completed
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify ownership before deleting — users can only remove their own items
    item = db.query(models.ChecklistItem).filter(
        models.ChecklistItem.id == item_id,
        models.ChecklistItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
