import React from 'react';

import { useState } from 'react';

function StatsPanel() {
  // Simulación de estadísticas
  const [stats] = useState({
    cursos: 8,
    usuarios: 32,
    lecciones: 120,
    evaluaciones: 45,
    recomendaciones: 17,
  });
  return (
    <div className="admin-section">
      <h3>Panel de Estadísticas</h3>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ background: '#23272f', borderRadius: 12, padding: 24, minWidth: 180, textAlign: 'center', boxShadow: '0 2px 12px #0002' }}>
          <div style={{ fontSize: 32, color: '#e94560', fontWeight: 700 }}>{stats.cursos}</div>
          <div style={{ color: '#bfc9d1', fontWeight: 500 }}>Cursos</div>
        </div>
        <div style={{ background: '#23272f', borderRadius: 12, padding: 24, minWidth: 180, textAlign: 'center', boxShadow: '0 2px 12px #0002' }}>
          <div style={{ fontSize: 32, color: '#e94560', fontWeight: 700 }}>{stats.usuarios}</div>
          <div style={{ color: '#bfc9d1', fontWeight: 500 }}>Usuarios</div>
        </div>
        <div style={{ background: '#23272f', borderRadius: 12, padding: 24, minWidth: 180, textAlign: 'center', boxShadow: '0 2px 12px #0002' }}>
          <div style={{ fontSize: 32, color: '#e94560', fontWeight: 700 }}>{stats.lecciones}</div>
          <div style={{ color: '#bfc9d1', fontWeight: 500 }}>Lecciones completadas</div>
        </div>
        <div style={{ background: '#23272f', borderRadius: 12, padding: 24, minWidth: 180, textAlign: 'center', boxShadow: '0 2px 12px #0002' }}>
          <div style={{ fontSize: 32, color: '#e94560', fontWeight: 700 }}>{stats.evaluaciones}</div>
          <div style={{ color: '#bfc9d1', fontWeight: 500 }}>Evaluaciones realizadas</div>
        </div>
        <div style={{ background: '#23272f', borderRadius: 12, padding: 24, minWidth: 180, textAlign: 'center', boxShadow: '0 2px 12px #0002' }}>
          <div style={{ fontSize: 32, color: '#e94560', fontWeight: 700 }}>{stats.recomendaciones}</div>
          <div style={{ color: '#bfc9d1', fontWeight: 500 }}>Recomendaciones generadas</div>
        </div>
      </div>
      {/* Aquí irían gráficas y KPIs reales */}
    </div>
  );
}

export default StatsPanel;
