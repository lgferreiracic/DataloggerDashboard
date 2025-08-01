import json
import time
import datetime
import threading
import requests
import os
from dotenv import load_dotenv
from paho.mqtt import client as mqtt

# Carrega variáveis de ambiente
load_dotenv()

# Firebase project configs
FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY')
FIREBASE_DB_URL = os.getenv('FIREBASE_DB_URL')

# Credenciais do usuário Firebase
EMAIL = os.getenv('EMAIL')
PASSWORD = os.getenv('PASSWORD')

# MQTT
MQTT_BROKER = os.getenv('MQTT_BROKER')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
MQTT_USER = os.getenv('MQTT_USER')
MQTT_PASSWORD = os.getenv('MQTT_PASSWORD')

# Variáveis globais
sensor_data = {
    "temperature": None,
    "humidity": None,
    "altitude": None,
    "gyroscope": None,
    "acceleration": None,
    "gyroscope_x": None,
    "gyroscope_y": None,
    "gyroscope_z": None,
    "acceleration_x": None,
    "acceleration_y": None,
    "acceleration_z": None,
    "timestamp": None,
    "userId": None  # <- obrigatório para passar na regra
}
id_token = None
user_uid = None

# Função para autenticar no Firebase
def firebase_login():
    global id_token, user_uid
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
    payload = {
        "email": EMAIL,
        "password": PASSWORD,
        "returnSecureToken": True
    }
    res = requests.post(url, json=payload)
    res.raise_for_status()
    data = res.json()
    id_token = data['idToken']
    user_uid = data['localId']
    sensor_data["userId"] = user_uid
    print(f"Autenticado como {EMAIL}, UID: {user_uid}")

def send_to_firebase():
    while True:
        time.sleep(5)
        if not id_token:
            continue

        # Atualize timestamp
        sensor_data["timestamp"] = datetime.datetime.now(datetime.UTC).isoformat()

        # Crie a estrutura correta para obedecer às regras
        payload = {
            "userId": user_uid,
            "current": sensor_data.copy()
        }

        # Envie tudo para o nível /sensors/{uid}
        url = f"{FIREBASE_DB_URL}/sensors/{user_uid}/readings.json?auth={id_token}"
        try:
            res = requests.post(url, json=payload)
            if res.status_code == 200:
                print("Enviado ao Firebase com sucesso.")
            else:
                print(f"Erro ao enviar: {res.text}")
        except Exception as e:
            print(f"Erro Firebase: {e}")

# Callback do MQTT
def on_message(client, userdata, msg):
    topic = msg.topic.strip('/')
    payload = msg.payload.decode()
    mapping = {
        "temperature": "temperature",
        "humidity": "humidity",
        "altitude": "altitude",
        "gyroscope/total": "gyroscope",
        "acceleration/total": "acceleration",
        "gyroscope/x": "gyroscope_x",
        "gyroscope/y": "gyroscope_y",
        "gyroscope/z": "gyroscope_z",
        "acceleration/x": "acceleration_x",
        "acceleration/y": "acceleration_y",
        "acceleration/z": "acceleration_z",
    }

    if topic in mapping:
        try:
            sensor_data[mapping[topic]] = float(payload)
            print(f"Recebido: {mapping[topic]} = {payload}")
        except ValueError:
            print(f"Valor inválido: {payload}")

# Inicia MQTT
def start_mqtt():
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)

    topics = [
        "/temperature", "/humidity", "/altitude",
        "/gyroscope/total", "/acceleration/total",
        "/gyroscope/x", "/gyroscope/y", "/gyroscope/z",
        "/acceleration/x", "/acceleration/y", "/acceleration/z"
    ]

    for topic in topics:
        client.subscribe(topic)

    client.loop_forever()

# Autentica no Firebase
firebase_login()

# Inicia threads
threading.Thread(target=send_to_firebase, daemon=True).start()
start_mqtt()
