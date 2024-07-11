from collections import defaultdict
from typing import List, Optional
from datetime import datetime
from dateutil import parser
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from app.auth import get_current_user
from app.models import User
from app.influx import get_query_api, BUCKET, ORG

router = APIRouter()


@router.get("/api/data")
def get_data(current_user: User = Depends(get_current_user), start: Optional[datetime] = None, end: Optional[datetime] = None, hub_ids: Optional[str] = None):
    query = f'from(bucket: "{BUCKET}") |> range(start:-1h) |> filter(fn: (r) => r["_measurement"] == "sensor_data") |> filter(fn: (r) => r["_field"] == "humidity" or r["_field"] == "temperature")'

    if start and end:
        query = f'from(bucket: "{BUCKET}") |> range(start:{start.isoformat()}, stop:{end.isoformat()}) |> filter(fn: (r) => r["_measurement"] == "sensor_data") |> filter(fn: (r) => r["_field"] == "humidity" or r["_field"] == "temperature")'
    if hub_ids:
        hubs = hub_ids.split(',')
        hub_filter = ' or '.join([f'r["hub_id"] == "{hub_id}"' for hub_id in hubs])
        query += f' |> filter(fn: (r) => {hub_filter})'

    result = get_query_api().query(org=ORG, query=query)
    
    data = defaultdict(lambda: {"temperature": None, "humidity": None})
    
    for table in result:
        for record in table.records:
            time = record["_time"].strftime("%Y/%m/%d, %H:%M:%S")
            if record["_field"] == "temperature":
                data[time]["temperature"] = record["_value"]
            elif record["_field"] == "humidity":
                data[time]["humidity"] = record["_value"]
            data[time]["hub_id"] = record["hub_id"]
            data[time]["time"] = time
    
    final_data = [{"time": time, **values} for time, values in data.items()]
    
    return JSONResponse(content=final_data)
