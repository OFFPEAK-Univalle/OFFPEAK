import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import anime from 'animejs/lib/anime.es.js';
import '../../styles/dashboard/AlertBanner.css';

export default function AlertBanner({ alertStatus, currentAfluencia, isMuted, setIsMuted, setShowModal, setCurrentAfluencia }) {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (alertStatus !== 'normal' && bannerRef.current) {
      anime({
        targets: bannerRef.current,
        translateY: [-100, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .6)'
      });
    }
  }, [alertStatus]);

  if (alertStatus === 'normal') return null;

  const isCritical = alertStatus === 'critical';

  return (
    <div
      ref={bannerRef}
      className={`alert-banner ${isCritical ? 'critical banner-pulse' : 'managing'}`}
    >
      <div className="alert-banner-info">
        <AlertCircle size={32} />
        <div>
          <h3 className="alert-banner-title">
            {isCritical ? '¡ALERTA CRÍTICA DE AFORO!' : 'INCIDENTE EN GESTIÓN'}
          </h3>
          <span className="alert-banner-subtitle">
            {isCritical
              ? `La ocupación ha superado el 85% (${currentAfluencia}%). Ejecutar protocolos.`
              : `Aplicando protocolos de mitigación. Aforo actual: ${currentAfluencia}%.`}
          </span>
        </div>
      </div>
      <div className="alert-banner-actions">
        {isCritical && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="btn-banner-action btn-banner-secondary"
          >
            {isMuted ? 'Activar Sonido' : 'Silenciar'}
          </button>
        )}
        <button
          onClick={() => isCritical ? setShowModal(true) : setCurrentAfluencia(65)}
          className={`btn-banner-action btn-banner-primary ${isCritical ? 'critical' : 'managing'}`}
        >
          {isCritical ? 'Gestionar Protocolo' : 'Forzar Resolución'}
        </button>
      </div>
    </div>
  );
}
