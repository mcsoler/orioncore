from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import List

from ..models import ContactCreate, ContactResponse
from ..database import get_contacts_collection
from ..security import require_token

router = APIRouter(prefix="/api", tags=["contact"])


@router.post("/contact", response_model=ContactResponse)
async def create_contact(contact: ContactCreate):
    collection = await get_contacts_collection()

    contact_dict = contact.model_dump()
    contact_dict["created_at"] = datetime.utcnow()

    result = await collection.insert_one(contact_dict)

    created_contact = await collection.find_one({"_id": result.inserted_id})

    return ContactResponse(
        id=str(created_contact["_id"]),
        name=created_contact["name"],
        phone=created_contact["phone"],
        email=created_contact["email"],
        created_at=created_contact["created_at"]
    )


@router.get("/contacts", response_model=List[ContactResponse], dependencies=[Depends(require_token)])
async def get_contacts():
    collection = await get_contacts_collection()

    contacts = []
    async for contact in collection.find().sort("created_at", -1):
        contacts.append(ContactResponse(
            id=str(contact["_id"]),
            name=contact["name"],
            phone=contact["phone"],
            email=contact["email"],
            created_at=contact["created_at"]
        ))

    return contacts


@router.get("/contact/{contact_id}", response_model=ContactResponse, dependencies=[Depends(require_token)])
async def get_contact(contact_id: str):
    collection = await get_contacts_collection()

    try:
        contact = await collection.find_one({"_id": ObjectId(contact_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid contact ID")

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    return ContactResponse(
        id=str(contact["_id"]),
        name=contact["name"],
        phone=contact["phone"],
        email=contact["email"],
        created_at=contact["created_at"]
    )
