import React, { useEffect, useRef } from 'react';
import { Shield, X, Clock } from 'lucide-react';
import anime from 'animejs/lib/anime.es.js';
import '../../styles/dashboard/ProtocolModal.css';

export default function ProtocolModal({ showModal, setShowModal, protocolActions, setProtocolActions, setAlertStatus }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (showModal) {
      // Animación del overlay
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });

      // Animación del modal
      anime({
        targets: modalRef.current,
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutBack'
      });

      // Animación escalonada (stagger) de los items
      anime({
        targets: '.protocol-checkbox-label',
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100, { start: 200 }),
        easing: 'easeOutQuad'
      });
    }
  }, [showModal]);

  if (!showModal) return null;

  const isAnyActionSelected = Object.values(protocolActions).some(val => val);

  return (
    <div ref={overlayRef} className="modal-overlay">
      <div ref={modalRef} className="glass-panel protocol-modal">
        <div className="protocol-modal-header">
          <h2 className="protocol-modal-title">
            < Shield color="var(--accent-cyan)" size={24} />
            Despliegue de Protocolo Táctico
          </h2>
          <X className="close-icon" onClick={() => setShowModal(false)} />
        </div>

        <div className="protocol-modal-subtitle-area">
          <span className="protocol-modal-zona">ZONA: JARDÍN PLAZA (COMUNA 17)</span>
          <p className="protocol-modal-desc">
            Seleccione las medidas operativas a coordinar con el Centro de Gestión de Movilidad para iniciar la mitigación del aforo:
          </p>
        </div>

        <div className="protocol-actions-list">
          <label className="protocol-checkbox-label">
            <input
              type="checkbox"
              className="protocol-checkbox"
              checked={protocolActions.trafficLights}
              onChange={e => setProtocolActions({ ...protocolActions, trafficLights: e.target.checked })}
            />
            <div>
              <div className="protocol-action-item-title">Ajuste de Ciclos Semafóricos</div>
              <div className="protocol-action-item-desc">Priorizar luz verde peatonal y vías de salida en perímetro.</div>
            </div>
          </label>

          <label className="protocol-checkbox-label">
            <input
              type="checkbox"
              className="protocol-checkbox"
              checked={protocolActions.agents}
              onChange={e => setProtocolActions({ ...protocolActions, agents: e.target.checked })}
            />
            <div>
              <div className="protocol-action-item-title">Despliegue de Guardas de Tránsito</div>
              <div className="protocol-action-item-desc">Despachar unidades móviles para regulación manual en intersecciones.</div>
            </div>
          </label>

          <label className="protocol-checkbox-label">
            <input
              type="checkbox"
              className="protocol-checkbox"
              checked={protocolActions.rerouting}
              onChange={e => setProtocolActions({ ...protocolActions, rerouting: e.target.checked })}
            />
            <div>
              <div className="protocol-action-item-title">Cierre Perimetral y Desvíos</div>
              <div className="protocol-action-item-desc">Restringir acceso vehicular particular en Calle 16 y Carrera 98.</div>
            </div>
          </label>

          <label className="protocol-checkbox-label">
            <input
              type="checkbox"
              className="protocol-checkbox"
              checked={protocolActions.mio}
              onChange={e => setProtocolActions({ ...protocolActions, mio: e.target.checked })}
            />
            <div>
              <div className="protocol-action-item-title">Contingencia SITM (MIO)</div>
              <div className="protocol-action-item-desc">Solicitar inyección de flota vacía a la estación Universidades.</div>
            </div>
          </label>
        </div>

        <div className="protocol-modal-footer-info">
          <p className="protocol-modal-footer-text">
            <Clock size={14} /> El sistema monitoreará la reducción del aforo tras aplicar las medidas.
          </p>
        </div>

        <div className="protocol-modal-btns">
          <button
            onClick={() => setShowModal(false)}
            className="btn-protocol btn-protocol-cancel"
          >
            CANCELAR
          </button>
          <button
            disabled={!isAnyActionSelected}
            onClick={() => {
              setAlertStatus('managing');
              setShowModal(false);
            }}
            className="btn-protocol btn-protocol-confirm"
          >
            EJECUTAR PROTOCOLO
          </button>
        </div>
      </div>
    </div>
  );
}
