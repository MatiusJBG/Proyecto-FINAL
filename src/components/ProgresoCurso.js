import React from 'react';
import './dashboard.css';

export default function ProgresoCurso({ progreso = 0, nombreCurso = '' }) {
  return (
    <div className="tarjeta progreso-curso">
      <div className="tarjeta-titulo">Progreso en {nombreCurso}</div>
      <div className="barra-progreso">
        <div className="barra-progreso-llena" style={{ width: `${progreso}%` }} />
      </div>
      <div className="progreso-porcentaje">{progreso}% completado</div>
    </div>
  );
} 