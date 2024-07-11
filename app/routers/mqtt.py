import os
import re
from fastapi import APIRouter
import paho.mqtt.client as mqtt
from influxdb_client import Point

from app.influx import BUCKET, ORG, get_write_api


router = APIRouter()

client = mqtt.Client()

def extract_numbers(text):
    numbers = re.findall(r'\d+\.\d+|\d+', text)
    converted_numbers = [float(num) if '.' in num else int(num) for num in numbers]
    
    return converted_numbers

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Connected to MQTT Broker with code {rc}!")
        client.subscribe("sensor/data/#")
    else:
        print(f"Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    message = extract_numbers(msg.payload.decode())
    hub_id = msg.topic.split('/')[-1]
    save_to_influxdb(hub_id, message)

def save_to_influxdb(hub_id, data):
    point = Point("sensor_data") \
        .tag("hub_id", hub_id) \
        .field("temperature", data[0]) \
        .field("humidity", data[1])
    get_write_api().write(bucket=BUCKET, org=ORG, record=point)

client.on_connect = on_connect
client.on_message = on_message

broker_host = os.getenv("BROKER_HOST", "localhost")
broker_port = os.getenv("BROKER_PORT", 1883)

client.connect(broker_host, broker_port)
client.loop_start()