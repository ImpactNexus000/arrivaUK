from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import bcrypt
import os

from app.database import get_db
from app import models

load_dotenv()

# Load secret key from environment; fallback is only safe for local development
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7  # Tokens are valid for 7 days

# Bearer token scheme — expects "Authorization: Bearer <token>" header
security = HTTPBearer()


def hash_password(password: str) -> str:
    # bcrypt automatically salts the hash, making each hash unique
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Constant-time comparison prevents timing attacks
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    # "sub" (subject) is the standard JWT claim for identifying the user
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.UserProfile:
    """FastAPI dependency that validates the Bearer token and returns the authenticated user."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        # Catches expired tokens, malformed tokens, and missing/invalid "sub" claim
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = db.query(models.UserProfile).filter(models.UserProfile.id == user_id).first()
    if not user:
        # Token is valid but the user was deleted after it was issued
        raise HTTPException(status_code=401, detail="User not found")
    return user
