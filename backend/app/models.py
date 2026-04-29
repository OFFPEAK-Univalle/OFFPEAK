"""
OffPeak - models.py
Tablas SQLAlchemy que reflejan el schema de Supabase (Sprint 1)
"""

import uuid
from uuid import UUID
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    JSON,
    Uuid,
    Index,
)
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.sql import func


# ─────────────────────────────
# Base declarativa
# ─────────────────────────────
class Base(DeclarativeBase):
    pass


# ─────────────────────────────
# 1. USERS
# ─────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: UUID = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    nombre: str = Column(Text, nullable=False)
    email: str = Column(Text, nullable=False, unique=True)
    password_hash: str = Column(Text, nullable=False)
    rol: str = Column(
        Text,
        nullable=False,
        default="ciudadano",
    )
    created_at: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relaciones
    alerts = relationship("Alert", back_populates="usuario", passive_deletes=True)
    __table_args__ = (
        CheckConstraint(
            "rol IN ('ciudadano', 'autoridad', 'admin')",
            name="ck_users_rol",
        ),
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} rol={self.rol}>"


# ─────────────────────────────
# 2. VENUES
# ─────────────────────────────
class Venue(Base):
    __tablename__ = "venues"

    id: UUID = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    besttime_venue_id: Optional[str] = Column(Text, unique=True, nullable=True)
    nombre: str = Column(Text, nullable=False)
    direccion: Optional[str] = Column(Text, nullable=True)
    categoria: Optional[str] = Column(Text, nullable=True)
    latitud: float = Column(Float, nullable=False)
    longitud: float = Column(Float, nullable=False)
    ciudad: str = Column(Text, nullable=False, default="Cali")
    activo: bool = Column(Boolean, nullable=False, default=True)
    created_at: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index("idx_venues_nombre", "nombre"),
        Index("idx_venues_ciudad", "ciudad"),
    )

    # Relaciones
    forecasts = relationship("Forecast", back_populates="venue", passive_deletes=True)
    cache_entries = relationship("CacheEntry", back_populates="venue", passive_deletes=True)
    alerts = relationship("Alert", back_populates="venue", passive_deletes=True)

    def __repr__(self) -> str:
        return f"<Venue id={self.id} nombre={self.nombre} ciudad={self.ciudad}>"


# ─────────────────────────────
# 3. FORECASTS
# ─────────────────────────────
class Forecast(Base):
    __tablename__ = "forecasts"

    id: UUID = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    venue_id: UUID = Column(
        Uuid(as_uuid=True),
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False,
    )
    dia_semana: int = Column(SmallInteger, nullable=False)   # 0=lunes … 6=domingo
    hora: int = Column(SmallInteger, nullable=False)         # 0–23
    indice_afluencia: int = Column(SmallInteger, nullable=False)  # 0–100
    nivel: str = Column(Text, nullable=False)                # bajo | medio | alto
    periodo_inicio: datetime = Column(DateTime(timezone=True), nullable=False)
    obtenido_en: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relaciones
    venue = relationship("Venue", back_populates="forecasts")

    __table_args__ = (
        CheckConstraint("dia_semana BETWEEN 0 AND 6",   name="ck_forecasts_dia"),
        CheckConstraint("hora BETWEEN 0 AND 23",         name="ck_forecasts_hora"),
        CheckConstraint(
            "indice_afluencia BETWEEN 0 AND 100",
            name="ck_forecasts_indice",
        ),
        CheckConstraint(
            "nivel IN ('bajo', 'medio', 'alto')",
            name="ck_forecasts_nivel",
        ),
        UniqueConstraint(
            "venue_id", "dia_semana", "hora", "periodo_inicio",
            name="uq_forecasts_slot",
        ),
        Index("idx_forecasts_venue", "venue_id", "dia_semana", "hora"),
    )

    def __repr__(self) -> str:
        return (
            f"<Forecast venue={self.venue_id} "
            f"dia={self.dia_semana} hora={self.hora} nivel={self.nivel}>"
        )


# ─────────────────────────────
# 4. CACHE_ENTRIES
# ─────────────────────────────
class CacheEntry(Base):
    __tablename__ = "cache_entries"

    id: UUID = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    venue_id: UUID = Column(
        Uuid(as_uuid=True),
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False,
    )
    endpoint_key: str = Column(Text, nullable=False)   # ej: "forecast_week"
    respuesta_raw: dict = Column(JSON, nullable=False) # JSON crudo de BestTime
    expira_en: datetime = Column(DateTime(timezone=True), nullable=False)
    creado_en: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relaciones
    venue = relationship("Venue", back_populates="cache_entries")

    __table_args__ = (
        UniqueConstraint(
            "venue_id", "endpoint_key",
            name="uq_cache_venue_endpoint",
        ),
        Index("idx_cache_venue", "venue_id", "endpoint_key"),
        Index("idx_cache_expira", "expira_en"),
    )

    @property
    def is_valid(self) -> bool:
        """Devuelve True si el caché todavía no expiró."""
        from datetime import timezone
        return datetime.now(timezone.utc) < self.expira_en

    def __repr__(self) -> str:
        return (
            f"<CacheEntry venue={self.venue_id} "
            f"key={self.endpoint_key} expira={self.expira_en}>"
        )


# ─────────────────────────────
# 5. ALERTS
# ─────────────────────────────
class Alert(Base):
    __tablename__ = "alerts"

    id: UUID = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    venue_id: UUID = Column(
        Uuid(as_uuid=True),
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False,
    )
    usuario_id: Optional[UUID] = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    tipo: str = Column(Text, nullable=False)
    mensaje: str = Column(Text, nullable=False)
    leida: bool = Column(Boolean, nullable=False, default=False)
    generada_en: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relaciones
    venue = relationship("Venue", back_populates="alerts")
    usuario = relationship("User", back_populates="alerts")
    __table_args__ = (
        CheckConstraint(
            "tipo IN ('congestion_alta', 'congestion_media', 'normalizado')",
            name="ck_alerts_tipo",
        ),
        Index("idx_alerts_venue", "venue_id"),
        Index("idx_alerts_usuario", "usuario_id", "leida"),
    )

    def __repr__(self) -> str:
        return (
            f"<Alert venue={self.venue_id} tipo={self.tipo} leida={self.leida}>"
        )