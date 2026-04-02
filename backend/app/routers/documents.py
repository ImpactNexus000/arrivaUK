from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])

SEED_DOCUMENTS = [
    # Travel & Immigration
    {"title": "Valid Passport", "description": "Your passport must be valid for the duration of your stay in the UK", "category": "travel", "icon": "🛂", "tip": "Make a colour photocopy and store it separately from the original. Keep a digital scan in your email too.", "sort_order": 1},
    {"title": "UK Visa / Entry Clearance", "description": "Student visa vignette or entry clearance sticker in your passport", "category": "travel", "icon": "📋", "tip": "Your visa vignette is only valid for 90 days — you must enter the UK within this window and collect your BRP.", "sort_order": 2},
    {"title": "BRP (Biometric Residence Permit)", "description": "Collect from your designated post office within 10 days of arrival", "category": "travel", "icon": "🪪", "tip": "Your decision letter has the post office address. Bring your passport and the decision letter when collecting.", "sort_order": 3},
    {"title": "CAS Letter (Confirmation of Acceptance)", "description": "Official letter from your university confirming your place and course details", "category": "university", "icon": "🎓", "tip": "You'll need the CAS number for your visa application. Keep this safe — it links to your immigration record.", "sort_order": 4},
    {"title": "University Offer Letter", "description": "Unconditional or conditional offer letter from your university", "category": "university", "icon": "📨", "tip": "Some banks and landlords ask for this as proof of student status.", "sort_order": 5},

    # University & Academic
    {"title": "Academic Transcripts & Certificates", "description": "Original degree certificates and transcripts from previous studies", "category": "university", "icon": "📜", "tip": "Bring originals plus certified translations if they're not in English. Some universities verify these during enrolment.", "sort_order": 6},
    {"title": "English Language Test Results", "description": "IELTS, TOEFL, or PTE certificate proving English proficiency", "category": "university", "icon": "📝", "tip": "Most results are valid for 2 years. Keep the original — your university may ask to see it.", "sort_order": 7},
    {"title": "Student ID Card", "description": "Collected during university enrolment — your key to campus access and discounts", "category": "university", "icon": "🆔", "tip": "Register online before arriving so you can collect your ID on enrolment day. It doubles as a library card.", "sort_order": 8},

    # Financial
    {"title": "Proof of Funds / Bank Statements", "description": "Evidence you can financially support yourself during your studies", "category": "financial", "icon": "💷", "tip": "UKVI typically requires 28 consecutive days of bank statements showing the required maintenance amount.", "sort_order": 9},
    {"title": "Scholarship / Sponsorship Letter", "description": "If you have a scholarship or sponsor, bring official confirmation", "category": "financial", "icon": "🏅", "tip": "This should state the amount, duration, and what it covers (tuition, living costs, or both).", "sort_order": 10},
    {"title": "Tuition Fee Payment Receipt", "description": "Proof of any tuition deposits or payments already made", "category": "financial", "icon": "🧾", "tip": "Keep digital and printed copies. Your university finance office can re-issue these if needed.", "sort_order": 11},

    # Health & Insurance
    {"title": "IHS (Immigration Health Surcharge) Confirmation", "description": "Proof of payment for NHS access — paid as part of your visa application", "category": "health", "icon": "🏥", "tip": "Your IHS reference number is linked to your visa. Once in the UK, register with a GP to access NHS services.", "sort_order": 12},
    {"title": "Travel / Health Insurance Policy", "description": "Cover for the period before your IHS/NHS access begins, or additional private cover", "category": "health", "icon": "🛡️", "tip": "Some policies cover lost luggage and trip cancellation too. Check if your university offers a group scheme.", "sort_order": 13},
    {"title": "Medical Records & Prescriptions", "description": "Vaccination records, prescriptions for ongoing medication, and GP letters", "category": "health", "icon": "💊", "tip": "Bring enough medication for your first month. Get a letter from your doctor explaining any prescriptions.", "sort_order": 14},

    # Housing & Practical
    {"title": "Accommodation Confirmation", "description": "Booking confirmation for university halls or private accommodation", "category": "housing", "icon": "🏠", "tip": "This counts as proof of address for bank accounts. Make sure it shows your name and UK address.", "sort_order": 15},
    {"title": "Proof of Address (UK)", "description": "A utility bill, bank statement, or tenancy agreement showing your UK address", "category": "housing", "icon": "📬", "tip": "You'll need this to open a bank account, register with a GP, and get a library card. A uni letter works initially.", "sort_order": 16},
    {"title": "Passport-Size Photos", "description": "Bring several passport-size photos for ID cards, travel cards, and applications", "category": "other", "icon": "📸", "tip": "UK photo booths cost £5-8. Bring 6-8 photos from home to save money.", "sort_order": 17},
    {"title": "TB Test Certificate (if required)", "description": "Required for visa applicants from certain countries — check GOV.UK for the list", "category": "health", "icon": "🔬", "tip": "Must be from an approved clinic. Results are valid for 6 months from the test date.", "sort_order": 18},
]


@router.post("/seed", response_model=list[schemas.DocumentResponse])
def seed_documents(
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(models.Document).filter(
        models.Document.user_id == current_user.id,
        models.Document.is_default == True,
    ).first()
    if existing:
        return db.query(models.Document).filter(
            models.Document.user_id == current_user.id
        ).order_by(models.Document.sort_order).all()

    items = []
    for doc in SEED_DOCUMENTS:
        item = models.Document(user_id=current_user.id, is_default=True, **doc)
        db.add(item)
        items.append(item)
    db.commit()
    for item in items:
        db.refresh(item)
    return items


@router.get("/", response_model=list[schemas.DocumentResponse])
def get_documents(
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Document)
        .filter(models.Document.user_id == current_user.id)
        .order_by(models.Document.sort_order)
        .all()
    )


@router.patch("/{doc_id}/status", response_model=schemas.DocumentResponse)
def update_status(
    doc_id: int,
    body: schemas.DocumentUpdateStatus,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id,
        models.Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if body.status not in ("not_started", "in_progress", "ready"):
        raise HTTPException(status_code=400, detail="Invalid status")
    doc.status = body.status
    db.commit()
    db.refresh(doc)
    return doc


@router.post("/", response_model=schemas.DocumentResponse)
def create_document(
    doc: schemas.DocumentCreate,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    max_order = (
        db.query(models.Document.sort_order)
        .filter(models.Document.user_id == current_user.id)
        .order_by(models.Document.sort_order.desc())
        .first()
    )
    new_doc = models.Document(
        user_id=current_user.id,
        is_default=False,
        sort_order=(max_order[0] + 1) if max_order else 100,
        **doc.model_dump(),
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc


@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id,
        models.Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"ok": True}
