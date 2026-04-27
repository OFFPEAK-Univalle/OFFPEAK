import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import Venue
from app.schemas import VenueCreate, VenueUpdate, VenueResponse
from app.services.besttime import obtener_forecast_venue, BestTimeError

router = APIRouter(tags=["Venues"])

@router.post("/", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
async def create_venue(venue_in: VenueCreate, db: AsyncSession = Depends(get_db)):
    """
    Crea un nuevo establecimiento en la base de datos local.
    """
    if not venue_in.nombre and venue_in.besttime_venue_id:
        import httpx
        from app.services.besttime import _forecast_por_venue_id
        try:
            data = await _forecast_por_venue_id(venue_in.besttime_venue_id)
            v_info = data.get("venue_info", {})
            venue_in.nombre = v_info.get("venue_name", "Sin Nombre")
            venue_in.direccion = v_info.get("venue_address")
            venue_in.latitud = v_info.get("venue_lat", 0.0)
            venue_in.longitud = v_info.get("venue_lng", 0.0)
        except httpx.HTTPError:
            raise HTTPException(status_code=400, detail="Error consumiendo API BestTime")
            
    if not venue_in.nombre or venue_in.latitud is None:
        raise HTTPException(status_code=422, detail="Falta el nombre/coordenadas, o un besttime_venue_id válido")

    nuevo_venue = Venue(
        nombre=venue_in.nombre,
        direccion=venue_in.direccion,
        categoria=venue_in.categoria,
        latitud=venue_in.latitud,
        longitud=venue_in.longitud,
        ciudad=venue_in.ciudad,
        activo=venue_in.activo,
        besttime_venue_id=venue_in.besttime_venue_id
    )
    db.add(nuevo_venue)
    await db.commit()
    await db.refresh(nuevo_venue)

    # Si hicimos un auto-fill consumimos 1 crédito y recibimos el forecast. Lo guardamos en Caché
    # para que las aplicaciones móviles lo usen por los próximos 14 días con 0 costo.
    if 'data' in locals() and data:
        from app.models import CacheEntry
        from datetime import datetime, timezone, timedelta
        from app.services.besttime import _parsear_forecasts

        venue_forecasted = data.get("venue_forecasted", False)
        forecasts = _parsear_forecasts(data)
        venue_info = data.get("venue_info", {})

        respuesta_final = {
            "venue_id": str(nuevo_venue.id),
            "venue_nombre": nuevo_venue.nombre,
            "besttime_venue_id": nuevo_venue.besttime_venue_id,
            "venue_direccion": venue_info.get("venue_address"),
            "venue_forecasted": venue_forecasted,
            "aviso": None if venue_forecasted else "No hay datos de BestTime aún.",
            "consultado_en": datetime.now(tz=timezone.utc).isoformat(),
            "total_slots": len(forecasts),
            "forecasts": forecasts,
        }

        nuevo_cache = CacheEntry(
            venue_id=nuevo_venue.id,
            endpoint_key="forecast_week",
            respuesta_raw=respuesta_final,
            expira_en=datetime.now(timezone.utc) + timedelta(days=14)
        )
        db.add(nuevo_cache)
        await db.commit()
    return nuevo_venue

@router.get("/", response_model=List[VenueResponse])
async def list_venues(db: AsyncSession = Depends(get_db), limit: int = 50, offset: int = 0):
    """
    Lista los establecimientos registrados localmente.
    """
    result = await db.execute(select(Venue).offset(offset).limit(limit))
    venues = result.scalars().all()
    return venues

@router.patch("/{venue_id}", response_model=VenueResponse)
async def update_venue(venue_id: uuid.UUID, datos: VenueUpdate, db: AsyncSession = Depends(get_db)):
    """
    Actualiza parcialmente un venue (direccion, besttime_venue_id, etc.).
    Útil para vincular un venue local con su ID en BestTime.
    """
    result = await db.execute(select(Venue).where(Venue.id == venue_id))
    venue = result.scalar_one_or_none()

    if not venue:
        raise HTTPException(status_code=404, detail=f"Venue {venue_id} no encontrado")

    # Solo actualizamos los campos que no son None
    cambios = datos.model_dump(exclude_none=True)
    for campo, valor in cambios.items():
        setattr(venue, campo, valor)

    await db.commit()
    await db.refresh(venue)
    return venue

@router.get("/{venue_id}/forecasts")
async def get_venue_forecasts(venue_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Retorna el pronóstico de un establecimiento.
    Lo consulta en BestTime API usando el servicio.
    """
    try:
        data = await obtener_forecast_venue(db, str(venue_id))
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BestTimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
