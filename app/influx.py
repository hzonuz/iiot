import os
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS

BUCKET = os.getenv("INFLUXDB_BUCKET")
ORG = os.getenv("INFLUXDB_ORG")
TOKEN = os.getenv("INFLUXDB_TOKEN")
URL = os.getenv("INFLUXDB_URL")

influx_client = InfluxDBClient(url=URL, token=TOKEN, org=ORG)
write_api = influx_client.write_api(write_options=SYNCHRONOUS)
query_api = influx_client.query_api()


def get_influx_client():
    return influx_client


def get_write_api():
    return write_api


def get_query_api():
    return query_api
