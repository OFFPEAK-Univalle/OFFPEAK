import json
import httpx
import os
import sys

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "app", "data", "venues_cali.json")
API_URL = "http://127.0.0.1:8000/api/v1/venues/"

def main():
    if not os.path.exists(DATA_FILE):
        print(f"Error: No se encontró el archivo JSON en {DATA_FILE}")
        sys.exit(1)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        venues = json.load(f)

    print(f"=========================================")
    print(f"🚀 Iniciando Seeding de {len(venues)} lugares...")
    print(f"=========================================")
    
    with httpx.Client(timeout=10.0) as client:
        for venue in venues:
            try:
                # API Gateway
                response = client.post(API_URL, json=venue)
                if response.status_code == 201:
                    print(f"✅ Creado: {venue['nombre']} -> ID asignado: {response.json()['id']}")
                else:
                    print(f"❌ Falló {venue['nombre']}. HTTP {response.status_code}: {response.text}")
            except Exception as e:
                print(f"⚠️ Excepción al conectar API para {venue['nombre']}: {str(e)}")

    print(f"=========================================")
    print("🎯 Seeding de Cali Finalizado.")

if __name__ == "__main__":
    main()
