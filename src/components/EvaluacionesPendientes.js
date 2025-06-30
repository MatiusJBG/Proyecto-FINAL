import React from 'react';
import './dashboard.css';

export default function EvaluacionesPendientes({ evaluaciones = [], onAccion }) {
  return (
    <div className="tarjeta evaluaciones-pendientes">
      <div className="tarjeta-titulo">Evaluaciones pendientes</div>
      <ul className="evaluaciones-lista">
        {evaluaciones.length === 0 && <li>No tienes evaluaciones pendientes.</li>}
        {evaluaciones.map((ev) => (
          <li key={ev.id} className="evaluacion-item">
            <span>{ev.nombre}</span>
            <button className="boton-secundario" onClick={() => onAccion(ev.id, ev.estado)}>
              {ev.estado === 'pendiente' ? 'Presentar' : 'Ver retroalimentación'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 