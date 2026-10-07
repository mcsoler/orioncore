from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ContactCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr


class ContactResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class SlotsResponse(BaseModel):
    remaining: int
    taken: int
    total: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
