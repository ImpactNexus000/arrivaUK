from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/deals", tags=["Deals"])

SEED_DEALS = [
    # Streaming & Entertainment
    {"title": "Spotify Premium Student", "provider": "Spotify", "description": "Half-price Premium plan with access to Hulu and SHOWTIME bundle for students", "category": "Entertainment", "savings": "Save 50%", "how_to_claim": "Verify student status via UNiDAYS on spotify.com/student", "link": "https://www.spotify.com/uk/student/", "icon": "🎵", "sort_order": 1},
    {"title": "Apple Music Student", "provider": "Apple", "description": "Student subscription includes Apple TV+ free for a limited time", "category": "Entertainment", "savings": "Save 50%", "how_to_claim": "Subscribe through Apple Music app and verify with UNiDAYS", "link": "https://music.apple.com/", "icon": "🍎", "sort_order": 2},
    {"title": "Amazon Prime Student", "provider": "Amazon", "description": "Free 6-month trial then half-price membership — includes Prime Video, free delivery, and more", "category": "Shopping", "savings": "6 months free + 50% off", "how_to_claim": "Sign up with your university email at amazon.co.uk/student", "link": "https://www.amazon.co.uk/student", "icon": "📦", "sort_order": 3},

    # Food & Drink
    {"title": "16–25 Railcard + Deliveroo", "provider": "Deliveroo", "description": "Free Deliveroo Plus for a year with your 16–25 Railcard purchase", "category": "Food", "savings": "Save £0 delivery fees", "how_to_claim": "Buy a 16–25 Railcard and link it in the Deliveroo app", "link": "https://deliveroo.co.uk/", "icon": "🍕", "sort_order": 4},
    {"title": "TOTUM McDonald's Deals", "provider": "McDonald's", "description": "Exclusive student meal deals and freebies via the TOTUM card app", "category": "Food", "savings": "Up to 20% off", "how_to_claim": "Download TOTUM app, verify student status, and show at checkout", "icon": "🍔", "sort_order": 5},
    {"title": "Pizza Hut Student Discount", "provider": "Pizza Hut", "description": "Student discount on dine-in and collection orders", "category": "Food", "savings": "25% off", "how_to_claim": "Show valid student ID or use StudentBeans code at checkout", "icon": "🍕", "sort_order": 6},

    # Travel & Transport
    {"title": "16–25 Railcard", "provider": "National Rail", "description": "Save a third on rail fares across the UK — pays for itself in a few trips", "category": "Travel", "savings": "Save ⅓ on fares", "how_to_claim": "Apply online at 16-25railcard.co.uk with a passport photo", "link": "https://www.16-25railcard.co.uk/", "icon": "🚂", "sort_order": 7},
    {"title": "Student Oyster Photocard", "provider": "TfL", "description": "30% off Travelcards and Bus & Tram passes in London", "category": "Travel", "savings": "30% off", "how_to_claim": "Apply via TfL website with a letter from your London-based university", "link": "https://tfl.gov.uk/fares/free-and-discounted-travel/student-oyster-photocard", "icon": "🚇", "sort_order": 8},
    {"title": "Student Coach Card", "provider": "National Express", "description": "Save on coach travel across the UK — great for budget long-distance trips", "category": "Travel", "savings": "⅓ off coach fares", "how_to_claim": "Buy online at nationalexpress.com/coachcard with student proof", "link": "https://www.nationalexpress.com/en/offers/coachcard", "icon": "🚌", "sort_order": 9},

    # Tech & Software
    {"title": "Apple Education Pricing", "provider": "Apple", "description": "Student discounts on MacBooks, iPads, and accessories with free AirPods during Back to School", "category": "Tech", "savings": "Up to 10% off + free AirPods", "how_to_claim": "Shop via apple.com/uk/shop/go/education and verify with UNiDAYS", "link": "https://www.apple.com/uk/shop/go/education", "icon": "💻", "sort_order": 10},
    {"title": "GitHub Student Developer Pack", "provider": "GitHub", "description": "Free access to developer tools, cloud credits, and domains while you're a student", "category": "Tech", "savings": "Free — worth £1,000+", "how_to_claim": "Apply at education.github.com with your university email", "link": "https://education.github.com/pack", "icon": "👨‍💻", "sort_order": 11},
    {"title": "Microsoft Office 365", "provider": "Microsoft", "description": "Full Office suite free for students — Word, Excel, PowerPoint, Teams, and 1TB OneDrive", "category": "Tech", "savings": "Free", "how_to_claim": "Sign up with your university email at office.com", "icon": "📊", "sort_order": 12},

    # Finance & Banking
    {"title": "Student Bank Account", "provider": "Santander / HSBC / Barclays", "description": "Interest-free overdrafts up to £3,000, free railcards, and cashback offers with UK student accounts", "category": "Finance", "savings": "Up to £3,000 interest-free", "how_to_claim": "Visit a local branch with your CAS letter, passport, BRP, and proof of address", "icon": "🏦", "sort_order": 13},
    {"title": "TOTUM / NUS Extra Card", "provider": "TOTUM", "description": "The official UK student discount card — accepted at hundreds of brands online and in-store", "category": "Shopping", "savings": "Save across 350+ brands", "how_to_claim": "Purchase via totum.com and verify with your university", "link": "https://www.totum.com/", "icon": "💳", "sort_order": 14},

    # Health & Wellbeing
    {"title": "Student Gym Memberships", "provider": "PureGym / The Gym Group", "description": "Discounted gym memberships — many campuses also have free or cheap sports centres", "category": "Health", "savings": "Up to 30% off", "how_to_claim": "Show student ID at sign-up or use StudentBeans for online codes", "icon": "🏋️", "sort_order": 15},
    {"title": "Free NHS Prescriptions", "provider": "NHS", "description": "If you're under 19 or on a low income, you may qualify for free prescriptions in England", "category": "Health", "savings": "Save £9.90 per item", "how_to_claim": "Apply for an HC2 certificate via nhsbsa.nhs.uk/nhs-low-income-scheme", "icon": "💊", "sort_order": 16},
]


@router.get("/", response_model=list[schemas.DealResponse])
def get_deals(db: Session = Depends(get_db)):
    return db.query(models.Deal).order_by(models.Deal.sort_order).all()


@router.post("/seed", response_model=list[schemas.DealResponse])
def seed_deals(db: Session = Depends(get_db)):
    existing = db.query(models.Deal).count()
    if existing > 0:
        return db.query(models.Deal).order_by(models.Deal.sort_order).all()

    for deal_data in SEED_DEALS:
        db.add(models.Deal(**deal_data))
    db.commit()
    return db.query(models.Deal).order_by(models.Deal.sort_order).all()
