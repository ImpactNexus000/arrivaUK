from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/community", tags=["Community"])


@router.get("/")
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    total = db.query(models.CommunityPost).count()
    posts = (
        db.query(models.CommunityPost)
        .options(joinedload(models.CommunityPost.replies))
        .order_by(models.CommunityPost.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"posts": posts, "total": total, "has_more": skip + limit < total}


@router.post("/", response_model=schemas.CommunityPostResponse)
def create_post(
    post: schemas.CommunityPostCreate,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_post = models.CommunityPost(
        user_id=current_user.id,
        author_name=current_user.name,
        content=post.content,
        category=post.category,
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


@router.put("/{post_id}", response_model=schemas.CommunityPostResponse)
def update_post(
    post_id: int,
    body: schemas.CommunityPostUpdate,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    if body.content is not None:
        post.content = body.content
    if body.category is not None:
        post.category = body.category
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    # Delete replies first
    db.query(models.PostReply).filter(models.PostReply.post_id == post_id).delete()
    db.delete(post)
    db.commit()
    return {"ok": True}


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
def reply_to_post(
    post_id: int,
    reply: schemas.PostReplyCreate,
    current_user: models.UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    new_reply = models.PostReply(
        post_id=post_id,
        author_name=current_user.name,
        content=reply.content,
    )
    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    return new_reply
