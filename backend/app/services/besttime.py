import os
import logging
from datetime import datetime, timezone, timedelta

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Venue, CacheEntry, Forecast

logger = logging.getLogger(__name__)

BESTTIME_API_KEY  = os.getenv("BESTTIME_API_KEY")
BESTTIME_BASE_URL = os.getenv("BESTTIME_BASE_URL", "https://besttime.app/api/v1")

BESTTIME_NO_DATA_HINTS = [
    "could not forecast this venue",
    "not does not have enough volume",
    "too new",
]


class BestTimeError(Exception):
    pass


def _calcular_nivel(indice: int) -> str:
    if indice >= 70:
        return "alto"
    elif indice >= 40:
        return "medio"
    return "bajo"


def _es_error_sin_datos(response_text: str) -> bool:
    text_lower = response_text.lower()
    return any(hint in text_lower for hint in BESTTIME_NO_DATA_HINTS)


def _parsear_forecasts(data: dict) -> list:
    """
    Parsea la respuesta de BestTime filtrando valores centinela:
      - intensity_nr < 0  : hora sin datos / venue cerrado (convención BestTime)
      - intensity_nr > 100: centinela de hora nocturna sin datos reales (ej: 999)
    Solo se guardan valores en el rango válido 0-100.
    """
    resultado = []
    for dia in data.get("analysis", []):
        dia_int = dia.get("day_info", {}).get("day_int")
        for h in dia.get("hour_analysis", []):
            indice = h.get("intensity_nr", 0)
            if indice < 0 or indice > 100:   # <-- filtro corregido
                continue
            resultado.append({
                "dia_semana":       dia_int,
                "hora":             h.get("hour"),
                "indice_afluencia": indice,
                "nivel":            _calcular_nivel(indice),
            })
    return resultado


def _respuesta_sin_datos(venue, aviso: str) -> dict:
    return {
        "venue_id":          str(venue.id),
        "venue_nombre":      venue.nombre,
        "besttime_venue_id": venue.besttime_venue_id,
        "venue_direccion":   venue.direccion,
        "venue_forecasted":  False,
        "aviso":             aviso,
        "consultado_en":     datetime.now(tz=timezone.utc).isoformat(),
        "total_slots":       0,
        "forecasts":         [],
    }


async def _forecasts_desde_db(db: AsyncSession, venue) -> dict:
    result = await db.execute(
        select(Forecast)
        .where(Forecast.venue_id == venue.id)
        .order_by(Forecast.dia_semana, Forecast.hora)
    )
    rows = result.scalars().all()

    if not rows:
        return None

    forecasts = [
        {
            "dia_semana":       row.dia_semana,
            "hora":             row.hora,
            "indice_afluencia": row.indice_afluencia,
            "nivel":            row.nivel,
        }
        for row in rows
    ]

    logger.info(f"[Fallback DB] {len(forecasts)} slots para {venue.nombre}")

    return {
        "venue_id":          str(venue.id),
        "venue_nombre":      venue.nombre,
        "besttime_venue_id": venue.besttime_venue_id,
        "venue_direccion":   venue.direccion,
        "venue_forecasted":  True,
        "aviso":             "Datos servidos desde historial local (tabla forecasts).",
        "consultado_en":     datetime.now(tz=timezone.utc).isoformat(),
        "total_slots":       len(forecasts),
        "forecasts":         forecasts,
    }


async def _guardar_cache(db: AsyncSession, venue, endpoint_key: str, respuesta: dict, dias: int = 365):
    expiracion = datetime.now(timezone.utc) + timedelta(days=dias)

    cache_result = await db.execute(
        select(CacheEntry).where(
            CacheEntry.venue_id == venue.id,
            CacheEntry.endpoint_key == endpoint_key,
        )
    )
    cache_entry = cache_result.scalar_one_or_none()

    if cache_entry:
        logger.info(f"[DB] Actualizando CacheEntry. Expira: {expiracion.isoformat()}")
        cache_entry.respuesta_raw = respuesta
        cache_entry.expira_en     = expiracion
    else:
        logger.info(f"[DB] Creando CacheEntry. Expira: {expiracion.isoformat()}")
        db.add(CacheEntry(
            venue_id=venue.id,
            endpoint_key=endpoint_key,
            respuesta_raw=respuesta,
            expira_en=expiracion,
        ))

    await db.commit()


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


async def obtener_forecast_venue(db: AsyncSession, venue_id: str, force_refresh: bool = False) -> dict:
    """
    Orquesta BestTime + cache local + fallback tabla forecasts.

    Prioridad:
      1. cache_entries (PostgreSQL)
      2. BestTime API
      3. tabla forecasts (DB)
      4. respuesta vacia valida (200, no 502)

    Raises ValueError    -> 404 (venue inexistente)
    Raises BestTimeError -> 502 (solo errores de red/auth reales)
    """

    # 1. Venue existe?
    result = await db.execute(
        select(Venue).where(Venue.id == venue_id, Venue.activo == True)
    )
    venue = result.scalar_one_or_none()
    if not venue:
        raise ValueError(f"Venue {venue_id} no encontrado o inactivo")

    # 2. Cache hit
    endpoint_key = "forecast_week"
    cache_result = await db.execute(
        select(CacheEntry).where(
            CacheEntry.venue_id == venue.id,
            CacheEntry.endpoint_key == endpoint_key,
        )
    )
    cache_entry = cache_result.scalar_one_or_none()

    if cache_entry and not force_refresh:
        logger.info(f"[Cache HIT] {venue.nombre} — expira {cache_entry.expira_en}")
        return cache_entry.respuesta_raw

    # 3. Sin API key
    if not BESTTIME_API_KEY:
        logger.warning("[BestTime] Sin API key — fallback DB")
        fallback = await _forecasts_desde_db(db, venue)
        if fallback:
            return fallback
        return _respuesta_sin_datos(venue, "BESTTIME_API_KEY no configurada y sin datos locales.")

    # 4. Sin identificadores utiles
    if not venue.besttime_venue_id and not venue.direccion:
        logger.warning(f"[BestTime] '{venue.nombre}' sin venue_id ni direccion — fallback DB")
        fallback = await _forecasts_desde_db(db, venue)
        if fallback:
            return fallback
        return _respuesta_sin_datos(venue, f"'{venue.nombre}' no tiene direccion ni ID de BestTime.")

    # 5. Llamar BestTime
    try:
        if venue.besttime_venue_id:
            logger.info(f"[API Call] BestTime venue_id para {venue.nombre}")
            data = await _forecast_por_venue_id(venue.besttime_venue_id)
        else:
            logger.info(f"[API Call] BestTime nombre/direccion para {venue.nombre}")
            data = await _forecast_por_nombre_direccion(venue.nombre, venue.direccion)

            bt_info     = data.get("venue_info", {})
            bt_venue_id = bt_info.get("venue_id")
            if bt_venue_id:
                venue.besttime_venue_id = bt_venue_id
            if bt_info.get("venue_address"):
                venue.direccion = bt_info["venue_address"]
            if bt_info.get("venue_lat"):
                venue.latitud = bt_info["venue_lat"]
            if bt_info.get("venue_lng"):
                venue.longitud = bt_info["venue_lng"]
            if any([bt_venue_id, bt_info.get("venue_address"), bt_info.get("venue_lat")]):
                await db.commit()
                logger.info(f"[DB] Venue enriquecido: besttime_id={bt_venue_id}")

    except httpx.HTTPStatusError as e:
        response_text = e.response.text
        logger.error(f"[HTTP Error BestTime] {e.response.status_code} — {response_text}")

        if _es_error_sin_datos(response_text):
            logger.warning(f"[Sin Datos] '{venue.nombre}' sin volumen — intentando fallback DB")
            fallback = await _forecasts_desde_db(db, venue)
            if fallback:
                return fallback
            respuesta_vacia = _respuesta_sin_datos(
                venue,
                "BestTime encontro este lugar pero aun no tiene suficiente trafico historico. "
                "Los datos estaran disponibles cuando BestTime recopile mas visitas."
            )
            await _guardar_cache(db, venue, endpoint_key, respuesta_vacia, dias=7)
            return respuesta_vacia

        if cache_entry:
            logger.warning("[SCRUM-27] HTTP error real — entregando cache vencido.")
            return cache_entry.respuesta_raw
        fallback = await _forecasts_desde_db(db, venue)
        if fallback:
            return fallback
        raise BestTimeError(f"BestTime error {e.response.status_code}")

    except httpx.RequestError as e:
        logger.error(f"[Request Error BestTime] {e}")
        if cache_entry:
            logger.warning("[SCRUM-27] Sin conexion — entregando cache vencido.")
            return cache_entry.respuesta_raw
        fallback = await _forecasts_desde_db(db, venue)
        if fallback:
            return fallback
        raise BestTimeError("Sin conexion con BestTime y sin datos locales.")

    # 6. Parsear respuesta (ya con filtro de centinelas en _parsear_forecasts)
    venue_forecasted = data.get("venue_forecasted", False)
    forecasts        = _parsear_forecasts(data)
    venue_info       = data.get("venue_info", {})

    respuesta_final = {
        "venue_id":          str(venue.id),
        "venue_nombre":      venue.nombre,
        "besttime_venue_id": venue.besttime_venue_id,
        "venue_direccion":   venue_info.get("venue_address"),
        "venue_forecasted":  venue_forecasted,
        "aviso":             None if venue_forecasted else "BestTime no tiene datos historicos suficientes.",
        "consultado_en":     datetime.now(tz=timezone.utc).isoformat(),
        "total_slots":       len(forecasts),
        "forecasts":         forecasts,
    }

    # 7. Upsert cache 365 dias
    await _guardar_cache(db, venue, endpoint_key, respuesta_final, dias=365)
    return respuesta_final