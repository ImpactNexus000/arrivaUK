from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app.include_router(checklist.router)
app.include_router(deals.router)
app.include_router(budget.router)
app.include_router(users.router)
app.include_router(community.router)


@app.get("/")
def root():
    return {"message": "ArriveUK API is running"}
