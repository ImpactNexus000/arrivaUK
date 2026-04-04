import os
import uuid
import shutil
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, create_otp_token, verify_otp_token,
)
from app.email_utils import generate_otp, send_otp_email

router = APIRouter(prefix="/users", tags=["Users"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

OTP_EXPIRY_MINUTES = 15


def save_upload(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return filename


@router.post("/send-otp")
def send_otp(req: schemas.OTPRequest, db: Session = Depends(get_db)):
    if req.purpose == "register":
        existing = db.query(models.UserProfile).filter(models.UserProfile.email == req.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    elif req.purpose in ("login", "reset"):
        existing = db.query(models.UserProfile).filter(models.UserProfile.email == req.email).first()
        if not existing:
            raise HTTPException(status_code=404, detail="No account found with this email")

    # Invalidate previous OTPs for this email+purpose
    db.query(models.OTPCode).filter(
        models.OTPCode.email == req.email,
        models.OTPCode.purpose == req.purpose,
    ).delete()

    code = generate_otp()
    otp = models.OTPCode(
        email=req.email,
        code=code,
        purpose=req.purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
    )
    db.add(otp)
    db.commit()

    send_otp_email(req.email, code, req.purpose)
    return {"message": "OTP sent successfully"}


@router.post("/verify-otp", response_model=schemas.OTPVerifyResponse)
def verify_otp(req: schemas.OTPVerify, db: Session = Depends(get_db)):
    otp = (
        db.query(models.OTPCode)
        .filter(
            models.OTPCode.email == req.email,
            models.OTPCode.code == req.code,
            models.OTPCode.verified == False,
        )
        .order_by(models.OTPCode.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    if otp.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired")

    otp.verified = True
    db.commit()

    token = create_otp_token(req.email)
    return schemas.OTPVerifyResponse(verified=True, otp_token=token)


@router.post("/register", response_model=schemas.TokenResponse)
async def register(
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    student_type: str = Form(...),
    university: str = Form(...),
    arrival_status: str = Form(...),
    otp_token: str = Form(...),
    profile_picture: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    # Verify OTP token
    verified_email = verify_otp_token(otp_token)
    if not verified_email or verified_email != email:
        raise HTTPException(status_code=400, detail="Email not verified. Please complete OTP verification first.")

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

    # Clean up OTP records for this email
    db.query(models.OTPCode).filter(models.OTPCode.email == email).delete()
    db.commit()

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserProfileResponse.model_validate(user))


@router.post("/login-request")
def login_request(creds: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Validates credentials and sends OTP for login."""
    user = db.query(models.UserProfile).filter(models.UserProfile.email == creds.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    if not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Invalidate previous login OTPs
    db.query(models.OTPCode).filter(
        models.OTPCode.email == creds.email,
        models.OTPCode.purpose == "login",
    ).delete()

    code = generate_otp()
    otp = models.OTPCode(
        email=creds.email,
        code=code,
        purpose="login",
        expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
    )
    db.add(otp)
    db.commit()

    send_otp_email(creds.email, code, "login")
    return {"message": "OTP sent to your email"}


@router.post("/login", response_model=schemas.TokenResponse)
def login(creds: schemas.LoginWithOTP, db: Session = Depends(get_db)):
    user = db.query(models.UserProfile).filter(models.UserProfile.email == creds.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    if not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify OTP code
    otp = (
        db.query(models.OTPCode)
        .filter(
            models.OTPCode.email == creds.email,
            models.OTPCode.code == creds.otp_code,
            models.OTPCode.purpose == "login",
            models.OTPCode.verified == False,
        )
        .order_by(models.OTPCode.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    if otp.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired")

    # Clean up OTP records
    db.query(models.OTPCode).filter(models.OTPCode.email == creds.email).delete()
    db.commit()

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserProfileResponse.model_validate(user))


@router.post("/reset-password")
def reset_password(req: schemas.ResetPassword, db: Session = Depends(get_db)):
    verified_email = verify_otp_token(req.otp_token)
    if not verified_email or verified_email != req.email:
        raise HTTPException(status_code=400, detail="Email not verified. Please complete OTP verification first.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = db.query(models.UserProfile).filter(models.UserProfile.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    user.hashed_password = hash_password(req.new_password)
    db.query(models.OTPCode).filter(models.OTPCode.email == req.email).delete()
    db.commit()

    return {"message": "Password reset successfully"}


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
