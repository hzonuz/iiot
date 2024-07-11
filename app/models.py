from typing import List, Optional
from sqlalchemy import Column, Integer, String
from pydantic import BaseModel
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Token(BaseModel):
    access_token: str
    token_type: str

class HubList(BaseModel):
    hubs: List[str]

class SensorData(BaseModel):
    time: str
    hub_id: str
    temperature: Optional[float]
    humidity: Optional[float]

class SensorDataList(BaseModel):
    data: list[SensorData]