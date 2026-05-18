from fastapi import APIRouter
from typing import Dict, List, Any

router = APIRouter(tags=["Multimodal"])

@router.get("/markers", response_model=Dict[str, List[Dict[str, Any]]])
async def get_multimodal_markers():
    """
    Retorna capas georreferenciadas reales de Cali para movilidad y utilidad ciudadana.
    Sirve como fuente de verdad para los mapas interactivos del frontend.
    """
    return {
        "parking": [
            {"id": 101, "name": "Parqueadero Bulevar", "coords": [3.4520, -76.5315], "status": "optimal"},
            {"id": 102, "name": "Parqueadero Terminal", "coords": [3.4685, -76.5260], "status": "moderate"},
            {"id": 103, "name": "Parqueadero Jardín Sur", "coords": [3.3770, -76.5290], "status": "optimal"},
        ],
        "mio": [
            {"id": 201, "name": "Estación Ermita", "coords": [3.4510, -76.5330]},
            {"id": 202, "name": "Estación Terminal", "coords": [3.4675, -76.5250]},
            {"id": 203, "name": "Estación Universidades Sur", "coords": [3.3750, -76.5295]},
        ],
        "security": [
            {"id": 301, "name": "CAI Bulevar", "coords": [3.4530, -76.5310]},
            {"id": 302, "name": "Estación Policía Centro", "coords": [3.4490, -76.5300]},
        ],
        "health": [
            {"id": 401, "name": "Cruz Roja Seccional Valle", "coords": [3.4400, -76.5350]},
            {"id": 402, "name": "Centro de Salud Comuna 3", "coords": [3.4550, -76.5300]},
        ],
        "comfort": [
            {"id": 501, "name": "Zona Arbolada (Sombra)", "coords": [3.4518, -76.5315]},
            {"id": 502, "name": "Punto de Hidratación", "coords": [3.4512, -76.5325]},
        ],
        "incidents": [
            {"id": 601, "name": "Bloqueo temporal en vía", "coords": [3.4505, -76.5340], "type": "roadblock"},
        ]
    }
