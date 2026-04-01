import os
import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Venue

logger = logging.getLogger(__name__)

BESTTIME_API_KEY  = os.getenv("BESTTIME_API_KEY")
BESTTIME_BASE_URL = os.getenv("BESTTIME_BASE_URL", "https://besttime.app/api/v1")


# ─────────────────────────────
# Excepciones personalizadas
# ─────────────────────────────
class BestTimeError(Exception):
    pass


# ─────────────────────────────
# Helpers
# ─────────────────────────────
def _calcular_nivel(indice: int) -> str:
    if indice >= 70:
        return "alto"
    elif indice >= 40:
        return "medio"
    return "bajo"


def _parsear_forecasts(data: dict) -> list[dict]:
    resultado = []
    for dia in data.get("analysis", []):
        dia_int = dia.get("day_info", {}).get("day_int")  # 0=lunes … 6=domingo
        for h in dia.get("hour_analysis", []):
            indice = h.get("intensity_nr", 0)
            if indice < 0:
                continue
            resultado.append(
                {
                    "dia_semana":       dia_int,
                    "hora":             h.get("hour"),
                    "indice_afluencia": indice,
                    "nivel":            _calcular_nivel(indice),
                }
            )
    return resultado


# ─────────────────────────────
# Llamadas a BestTime
# ─────────────────────────────
async def _forecast_por_venue_id(besttime_venue_id: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            f"{BESTTIME_BASE_URL}/forecasts",
            params={
                "api_key_private": BESTTIME_API_KEY,
                "venue_id":        besttime_venue_id,
            },
        )
        response.raise_for_status()
        return response.json()


async def _forecast_por_nombre_direccion(nombre: str, direccion: str) -> dict:

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{BESTTIME_BASE_URL}/forecasts",
            params={
                "api_key_private": BESTTIME_API_KEY,
                "venue_name":      nombre,
                "venue_address":   direccion,
            },
        )
        response.raise_for_status()
        return response.json()


# ─────────────────────────────
# Función principal
# ─────────────────────────────
async def obtener_forecast_venue(db: AsyncSession, venue_id: str) -> dict:
    """
    Orquesta la integración con BestTime para un venue dado.
    Retorna el forecast procesado listo para el endpoint REST.
    """
    if not BESTTIME_API_KEY:
        raise BestTimeError("BESTTIME_API_KEY no está configurada en el .env")

    # 1. Obtener el venue de la BD
    result = await db.execute(
        select(Venue).where(Venue.id == venue_id, Venue.activo == True)
    )
    venue = result.scalar_one_or_none()

    if not venue:
        raise ValueError(f"Venue {venue_id} no encontrado o inactivo")

    # 2. Llamar a BestTime según si ya tenemos su venue_id o no
    try:
        if venue.besttime_venue_id:
            logger.info(f"Consultando BestTime por venue_id: {venue.besttime_venue_id}")
            data = await _forecast_por_venue_id(venue.besttime_venue_id)
        else:
            if not venue.direccion:
                raise ValueError(
                    f"El venue '{venue.nombre}' no tiene dirección ni besttime_venue_id. "
                    "Agregá una dirección o el besttime_venue_id en Supabase."
                )
            logger.info(f"Consultando BestTime por nombre/dirección: {venue.nombre}")
            data = await _forecast_por_nombre_direccion(venue.nombre, venue.direccion)

            # Guardar el venue_id, dirección, lat y lng que BestTime retornó
            bt_info = data.get("venue_info", {})
            bt_venue_id = bt_info.get("venue_id")
            if bt_venue_id:
                venue.besttime_venue_id = bt_venue_id
            if bt_info.get("venue_address"):
                venue.direccion = bt_info["venue_address"]
            if bt_info.get("venue_lat"):
                venue.latitud  = bt_info["venue_lat"]
            if bt_info.get("venue_lng"):
                venue.longitud = bt_info["venue_lng"]
            if any([bt_venue_id, bt_info.get("venue_address"), bt_info.get("venue_lat")]):
                await db.commit()
                logger.info(f"Venue actualizado desde BestTime: id={bt_venue_id}, dir={bt_info.get('venue_address')}")

    except httpx.HTTPStatusError as e:
        logger.error(f"Error HTTP BestTime: {e.response.text}")
        raise BestTimeError(f"BestTime respondió con error {e.response.status_code}")
    except httpx.RequestError as e:
        logger.error(f"Error de conexión con BestTime: {e}")
        raise BestTimeError("No se pudo conectar con BestTime. Verificá tu conexión.")

    # 3. Parsear y retornar
    venue_forecasted = data.get("venue_forecasted", False)
    forecasts = _parsear_forecasts(data)
    venue_info = data.get("venue_info", {})

    return {
        "venue_id":          str(venue.id),
        "venue_nombre":      venue.nombre,
        "besttime_venue_id": venue.besttime_venue_id,
        "venue_direccion":   venue_info.get("venue_address"),
        "venue_forecasted":  venue_forecasted,
        "aviso":             None if venue_forecasted else (
            "BestTime no tiene suficientes datos históricos para este venue. "
            "Los forecasts estarán disponibles una vez que BestTime recopile visitas."
        ),
        "consultado_en":     datetime.now(tz=timezone.utc).isoformat(),
        "total_slots":       len(forecasts),
        "forecasts":         forecasts,
    }