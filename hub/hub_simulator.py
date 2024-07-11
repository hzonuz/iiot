import os
import paho.mqtt.client as mqtt
import time
import random
import argparse

# Parse command-line arguments
parser = argparse.ArgumentParser(description='MQTT Publisher')
parser.add_argument('hub_id', type=str, help='Hub ID to append to the topic')
parser.add_argument('sleep_duration', type=int, help='Time sleep duration in seconds')
args = parser.parse_args()

# MQTT broker details
broker = os.getenv("BROKER_HOST", "localhost")
port = os.getenv("BROKER_PORT", 1883)
topic = f"sensor/data/{args.hub_id}"

# Create an MQTT client instance
client = mqtt.Client()


# Function to connect to the broker
def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print(f"Failed to connect, return code {rc}\n")

    client.on_connect = on_connect
    client.connect(broker, port)
    return client


# Function to publish messages to the broker
def publish(client):
    while True:
        temperature = round(random.uniform(20.0, 25.0), 2)
        humidity = round(random.uniform(30.0, 60.0), 2)
        message = f"Temperature: {temperature}C, Humidity: {humidity}%"

        result = client.publish(topic, message)

        # Result code 0 means the message was sent successfully
        status = result[0]
        if status == 0:
            print(f"Sent `{message}` to topic `{topic}`")
        else:
            print(f"Failed to send message to topic {topic}")

        # Sleep for the specified duration before sending the next message
        time.sleep(args.sleep_duration)


# Connect to the broker and start publishing
client = connect_mqtt()
publish(client)
