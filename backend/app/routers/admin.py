from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.services.tasks import get_cleaner_status, clear_expired_cache

router = APIRouter(tags=["Admin"])

@router.get("/cleaner/status", response_model=Dict[str, Any])
async def check_cleaner_status():
    """
    Devuelve el estado actual de la tarea en segundo plano que limpia la caché.
    """
    return get_cleaner_status()

@router.post("/cleaner/force-run", response_model=Dict[str, Any])
async def force_run_cleaner():
    """
    Ejecuta manualmente el proceso de limpieza de la base de datos (eliminación de caché expirada).
    """
    try:
        deleted = await clear_expired_cache()
        return {
            "status": "success",
            "message": f"Limpieza forzada completada. Registros eliminados: {deleted}",
            "deleted_count": deleted
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error durante la limpieza forzada: {str(e)}")
