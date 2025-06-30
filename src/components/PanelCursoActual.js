import React from 'react';
import './dashboard.css';

export default function PanelCursoActual({ curso, modulo, leccion, onContinuar }) {
  return (
    <div className="tarjeta curso-actual">
      <div className="tarjeta-titulo">Mi curso actual</div>
      <div className="curso-nombre">{curso}</div>
      <div className="curso-detalle">Módulo: <strong>{modulo}</strong></div>
      <div className="curso-detalle">Lección: <strong>{leccion}</strong></div>
      <button className="boton-principal" onClick={onContinuar}>Continuar donde me quedé</button>
    </div>
  );
} 