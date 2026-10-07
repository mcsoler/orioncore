from fastapi import APIRouter, Response

from ..database import get_contacts_collection
from ..models import SlotsResponse
from ..slots import slots_for

router = APIRouter(prefix="/api", tags=["slots"])


@router.get("/slots", response_model=SlotsResponse)
async def get_slots(response: Response):
    """Cupos que quedan del diagnóstico gratuito (público, solo lectura)."""
    collection = await get_contacts_collection()
    submissions = await collection.count_documents({})
    response.headers["Cache-Control"] = "no-store"
    return slots_for(submissions)
