from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.database import Base, engine
from app.routers import data, mqtt, auth, ws


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(data.router)
app.include_router(mqtt.router)
app.include_router(auth.router)
app.include_router(ws.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
