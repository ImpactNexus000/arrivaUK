import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import checklist, deals, budget, users, community

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ArriveUK API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded profile pictures
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(checklist.router)
app.include_router(deals.router)
app.include_router(budget.router)
app.include_router(users.router)
app.include_router(community.router)


@app.get("/")
def root():
    return {"message": "ArriveUK API is running"}
