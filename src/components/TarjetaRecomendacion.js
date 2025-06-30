import React from 'react';
import './dashboard.css';

export default function TarjetaRecomendacion({ mensaje, justificacion }) {
  return (
    <div className="tarjeta recomendacion">
      <div className="tarjeta-titulo">Recomendación personalizada</div>
      <div className="recomendacion-mensaje">{mensaje}</div>
      <div className="recomendacion-justificacion">{justificacion}</div>
    </div>
  );
} 