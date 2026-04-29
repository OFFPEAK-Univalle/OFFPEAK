import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy import delete
from app.database import SessionLocal
from app.models import CacheEntry

logger = logging.getLogger(__name__)

# Control variables to check status from admin endpoints
_cleaner_task = None
_last_run = None
_is_running = False

async def clear_expired_cache():
    """
    Elimina las entradas de caché expiradas de la base de datos.
    """
    global _last_run
    async with SessionLocal() as db:
        try:
            # Usar timezone-aware actual date para comparar
            ahora = datetime.now(timezone.utc)
            stmt = delete(CacheEntry).where(CacheEntry.expira_en < ahora)
            result = await db.execute(stmt)
            await db.commit()
            
            deleted_count = result.rowcount
            _last_run = ahora
            if deleted_count > 0:
                logger.info(f"[Limpieza BD] {deleted_count} registros de caché expirados han sido eliminados.")
            else:
                logger.debug("[Limpieza BD] No se encontraron registros expirados para limpiar.")
                
            return deleted_count
        except Exception as e:
            logger.error(f"[Limpieza BD Error] Fallo al limpiar caché: {str(e)}")
            await db.rollback()
            return 0

async def db_cleaner_loop(interval_seconds: int = 600):
    """
    Bucle en segundo plano que se ejecuta cada `interval_seconds` (por defecto 10 minutos).
    """
    global _is_running
    _is_running = True
    logger.info(f"Iniciando tarea en segundo plano: Limpiador de Caché (intervalo: {interval_seconds}s)")
    
    try:
        while _is_running:
            await clear_expired_cache()
            await asyncio.sleep(interval_seconds)
    except asyncio.CancelledError:
        logger.info("Tarea en segundo plano cancelada.")
    finally:
        _is_running = False

def start_cleaner_task(interval_seconds: int = 600):
    global _cleaner_task
    if _cleaner_task is None or _cleaner_task.done():
        _cleaner_task = asyncio.create_task(db_cleaner_loop(interval_seconds))

def stop_cleaner_task():
    global _cleaner_task, _is_running
    _is_running = False
    if _cleaner_task and not _cleaner_task.done():
        _cleaner_task.cancel()

def get_cleaner_status():
    global _is_running, _last_run
    return {
        "is_running": _is_running,
        "last_run": _last_run.isoformat() if _last_run else None
    }
