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
    nuevo_venue = Venue(
        nombre=venue_in.nombre,
        direccion=venue_in.direccion,
        categoria=venue_in.categoria,
        latitud=venue_in.latitud,
        longitud=venue_in.longitud,
        ciudad=venue_in.ciudad,
        activo=venue_in.activo
    )
    db.add(nuevo_venue)
    await db.commit()
    await db.refresh(nuevo_venue)
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
