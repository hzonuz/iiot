from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import asyncio
import json

from app.influx import get_query_api, BUCKET, ORG

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/data")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            query = f'from(bucket: "{BUCKET}") |> range(start: -1m) |> filter(fn: (r) => r._measurement == "sensor_data") |> last()'
            result = get_query_api().query(org=ORG, query=query)
            data = {}

            for table in result:
                for record in table.records:
                    data[record["_field"]] = record["_value"]
                    data["time"] = record["_time"].strftime("%Y/%m/%d, %H:%M:%S")

            await manager.broadcast(json.dumps(data))

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        manager.disconnect(websocket)