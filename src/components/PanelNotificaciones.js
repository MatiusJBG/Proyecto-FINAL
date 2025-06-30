import React from 'react';
import './dashboard.css';

export default function PanelNotificaciones({ notificaciones = [] }) {
  return (
    <div className="tarjeta notificaciones">
      <div className="tarjeta-titulo">Notificaciones</div>
      <ul className="notificaciones-lista">
        {notificaciones.length === 0 && <li>No tienes notificaciones.</li>}
        {notificaciones.map((n) => (
          <li key={n.id} className="notificacion-item">
            <span className="notificacion-tipo">{n.tipo === 'tutor' ? '📩' : '⏰'}</span>
            <span>{n.mensaje}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 