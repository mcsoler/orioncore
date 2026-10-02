from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .database import Database
from .security import validate_settings
from .routes.auth import router as auth_router
from .routes.contact import router as contact_router

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_settings()
    await Database.connect()
    yield
    await Database.disconnect()


app = FastAPI(
    title="Orion Core API",
    description="API para la landing page de Orion Core Tecnologías",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(contact_router)


@app.get("/")
async def root():
    return {"message": "Orion Core API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
