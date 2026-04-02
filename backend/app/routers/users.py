import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_upload(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return filename


@router.post("/register", response_model=schemas.TokenResponse)
async def register(
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    student_type: str = Form(...),
    university: str = Form(...),
    arrival_status: str = Form(...),
    profile_picture: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    existing = db.query(models.UserProfile).filter(models.UserProfile.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    pic_filename = None
    if profile_picture and profile_picture.filename:
        pic_filename = save_upload(profile_picture)

    user = models.UserProfile(
        email=email,
        hashed_password=hash_password(password),
        name=name,
        student_type=student_type,
        university=university,
        arrival_status=arrival_status,
        profile_picture=pic_filename,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserProfileResponse.model_validate(user))


@router.post("/login", response_model=schemas.TokenResponse)
def login(creds: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.UserProfile).filter(models.UserProfile.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserProfileResponse.model_validate(user))


@router.get("/me", response_model=schemas.UserProfileResponse)
def get_me(current_user: models.UserProfile = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserProfileResponse)
async def update_me(
    name: str = Form(None),
    student_type: str = Form(None),
    university: str = Form(None),
    arrival_status: str = Form(None),
    profile_picture: UploadFile | None = File(None),
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if name is not None:
        current_user.name = name
    if student_type is not None:
        current_user.student_type = student_type
    if university is not None:
        current_user.university = university
    if arrival_status is not None:
        current_user.arrival_status = arrival_status
    if profile_picture and profile_picture.filename:
        # Remove old picture if exists
        if current_user.profile_picture:
            old_path = os.path.join(UPLOAD_DIR, current_user.profile_picture)
            if os.path.exists(old_path):
                os.remove(old_path)
        current_user.profile_picture = save_upload(profile_picture)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=schemas.UserProfileResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.UserProfile).filter(models.UserProfile.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
