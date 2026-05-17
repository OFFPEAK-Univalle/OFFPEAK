from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from app.database import get_db
from app.models import Alert
from app.schemas import AlertResponse, AlertCreate

router = APIRouter(tags=["Alerts"])

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    db: AsyncSession = Depends(get_db), 
    limit: int = 50, 
    offset: int = 0,
    solo_no_leidas: bool = False
):
    """
    Obtiene la lista de alertas. Permite filtrar solo las no leídas.
    """
    query = select(Alert)
    
    if solo_no_leidas:
        query = query.where(Alert.leida == False)
        
    query = query.order_by(Alert.generada_en.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return alerts

@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(alert_in: AlertCreate, db: AsyncSession = Depends(get_db)):
    """
    Crea una nueva alerta manualmente (usualmente llamada desde servicios internos, pero expuesta para el admin dashboard).
    """
    nueva_alerta = Alert(
        venue_id=alert_in.venue_id,
        tipo=alert_in.tipo,
        mensaje=alert_in.mensaje
    )
    
    db.add(nueva_alerta)
    await db.commit()
    await db.refresh(nueva_alerta)
    return nueva_alerta

@router.patch("/{alert_id}/leer", response_model=AlertResponse)
async def marcar_como_leida(alert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Marca una alerta específica como leída.
    """
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alerta = result.scalar_one_or_none()
    
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
        
    alerta.leida = True
    await db.commit()
    await db.refresh(alerta)
    
    return alerta
