from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "orioncore")


class Database:
    client: Optional[AsyncIOMotorClient] = None

    @classmethod
    async def connect(cls):
        cls.client = AsyncIOMotorClient(MONGODB_URL)

    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()

    @classmethod
    def get_database(cls):
        return cls.client[DATABASE_NAME]

    @classmethod
    def get_collection(cls, name: str):
        return cls.get_database()[name]


async def get_contacts_collection():
    return Database.get_collection("contacts")
