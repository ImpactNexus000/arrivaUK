from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/community", tags=["Community"])


@router.get("/", response_model=list[schemas.CommunityPostResponse])
def get_posts(db: Session = Depends(get_db)):
    return (
        db.query(models.CommunityPost)
        .options(joinedload(models.CommunityPost.replies))
        .order_by(models.CommunityPost.created_at.desc())
        .all()
    )


@router.post("/", response_model=schemas.CommunityPostResponse)
def create_post(post: schemas.CommunityPostCreate, db: Session = Depends(get_db)):
    new_post = models.CommunityPost(**post.model_dump())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


@router.post("/{post_id}/like", response_model=schemas.CommunityPostResponse)
def like_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes_count += 1
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/reply", response_model=schemas.PostReplyResponse)
def reply_to_post(post_id: int, reply: schemas.PostReplyCreate, db: Session = Depends(get_db)):
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    new_reply = models.PostReply(post_id=post_id, **reply.model_dump())
    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    return new_reply
