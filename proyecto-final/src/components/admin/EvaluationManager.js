import React, { useState, useEffect } from 'react';
import Modal from './Modal';

function EvaluationManager() {
  const [estructura, setEstructura] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEstructura = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/estructura-completa', {
          credentials: 'include'
        });
        const data = await res.json();
        if (data && Array.isArray(data.cursos)) {
          setEstructura(data.cursos);
        } else {
          setError('No se pudo obtener la estructura de cursos');
        }
      } catch (e) {
        setError('Error de conexión con el servidor');
      }
      setLoading(false);
    };
    fetchEstructura();
  }, []);

  // Funciones para contar módulos, lecciones y evaluaciones
  const contarModulos = (curso) => Array.isArray(curso.modulos) ? curso.modulos.length : 0;
  const contarLecciones = (curso) => {
    if (!Array.isArray(curso.modulos)) return 0;
    return curso.modulos.reduce((acc, modulo) => acc + (Array.isArray(modulo.lecciones) ? modulo.lecciones.length : 0), 0);
  };
  const contarEvaluaciones = (curso) => {
    if (!Array.isArray(curso.modulos)) return 0;
    return curso.modulos.reduce((acc, modulo) => {
      if (!Array.isArray(modulo.lecciones)) return acc;
      return acc + modulo.lecciones.reduce((acc2, leccion) => acc2 + (Array.isArray(leccion.evaluaciones) ? leccion.evaluaciones.length : 0), 0);
    }, 0);
  };

  return (
    <div className="admin-section">
      <h3>Gestión de Evaluaciones</h3>
      {loading ? (
        <div style={{ color: '#bfc9d1', padding: 24 }}>Cargando datos...</div>
      ) : error ? (
        <div style={{ color: '#e94560', padding: 24 }}>{error}</div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23272f', borderRadius: 10, boxShadow: '0 2px 12px #0002' }}>
            <thead>
              <tr style={{ background: '#1a1d23', color: '#e94560' }}>
                <th style={{ padding: '12px 8px', minWidth: 180 }}>Curso</th>
                <th style={{ padding: '12px 8px', minWidth: 120 }}># Módulos</th>
                <th style={{ padding: '12px 8px', minWidth: 120 }}># Lecciones</th>
                <th style={{ padding: '12px 8px', minWidth: 120 }}># Evaluaciones</th>
              </tr>
            </thead>
            <tbody>
              {estructura.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#bfc9d1', padding: 24 }}>No hay cursos registrados.</td></tr>
              )}
              {estructura.map(curso => (
                <tr key={curso.id} style={{ background: '#23272f', borderBottom: '1px solid #353b48' }}>
                  <td style={{ color: '#fff', fontWeight: 600 }}>{curso.nombre}</td>
                  <td style={{ color: '#f1f1f1', textAlign: 'center' }}>{contarModulos(curso)}</td>
                  <td style={{ color: '#f1f1f1', textAlign: 'center' }}>{contarLecciones(curso)}</td>
                  <td style={{ color: '#f1f1f1', textAlign: 'center' }}>{contarEvaluaciones(curso)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EvaluationManager;
