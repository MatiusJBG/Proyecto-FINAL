import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronRight, FiBookOpen, FiFileText, FiCheckCircle } from 'react-icons/fi';
import './CourseTreeView.css';

const API_BASE_URL = 'http://localhost:5000/api';

function LeccionContent({ cursoId, nodoId }) {
  const [contenido, setContenido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/cursos/${cursoId}/nodo/${nodoId}`)
      .then(res => res.json())
      .then(data => {
        setContenido(data.nodo);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar el contenido');
        setLoading(false);
      });
  }, [cursoId, nodoId]);

  if (loading) return <div className="ctv-content">Cargando contenido...</div>;
  if (error) return <div className="ctv-content error">{error}</div>;
  if (!contenido) return null;
  return (
    <div className="ctv-content">
      <div className="ctv-content-title">{contenido.nombre}</div>
      <div className="ctv-content-body">{contenido.contenido || 'Sin contenido disponible.'}</div>
    </div>
  );
}

export default function CourseTreeView({ cursoId }) {
  const [estructura, setEstructura] = useState(null);
  const [expandedModulos, setExpandedModulos] = useState({});
  const [expandedLecciones, setExpandedLecciones] = useState({});
  const [selectedNodo, setSelectedNodo] = useState(null);

  useEffect(() => {
    if (cursoId) {
      fetch(`${API_BASE_URL}/cursos/${cursoId}/estructura`)
        .then(res => res.json())
        .then(data => setEstructura(data))
        .catch(() => setEstructura(null));
    }
  }, [cursoId]);

  const toggleModulo = (moduloId) => {
    setExpandedModulos(prev => ({ ...prev, [moduloId]: !prev[moduloId] }));
  };
  const toggleLeccion = (leccionId) => {
    setExpandedLecciones(prev => ({ ...prev, [leccionId]: !prev[leccionId] }));
  };

  if (!estructura) return <div className="ctv-root">Cargando estructura...</div>;

  return (
    <div className="ctv-root">
      <div className="ctv-title">{estructura.nombre}</div>
      {estructura.modulos && estructura.modulos.map(modulo => (
        <div className="ctv-modulo" key={modulo.id}>
          <div className="ctv-modulo-header" onClick={() => toggleModulo(modulo.id)}>
            {expandedModulos[modulo.id] ? <FiChevronDown /> : <FiChevronRight />}
            <span className="ctv-modulo-title">{modulo.nombre}</span>
            <span className="ctv-modulo-desc">{modulo.descripcion}</span>
          </div>
          {expandedModulos[modulo.id] && (
            <div className="ctv-modulo-body">
              {/* Lecciones */}
              {modulo.lecciones && modulo.lecciones.length > 0 && (
                <div className="ctv-lecciones-block">
                  <div className="ctv-block-title">Lecciones</div>
                  {modulo.lecciones.map(leccion => (
                    <div key={leccion.id} className="ctv-leccion">
                      <div className="ctv-leccion-header" onClick={() => setSelectedNodo(selectedNodo === leccion.id ? null : leccion.id)}>
                        <span className="ctv-leccion-icon"><FiBookOpen /></span>
                        <span className="ctv-leccion-title">{leccion.nombre}</span>
                        {selectedNodo === leccion.id ? <FiChevronDown /> : <FiChevronRight />}
                      </div>
                      {selectedNodo === leccion.id && (
                        <LeccionContent cursoId={cursoId} nodoId={leccion.id} />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Evaluaciones */}
              {modulo.evaluaciones && modulo.evaluaciones.length > 0 && (
                <div className="ctv-evaluaciones-block">
                  <div className="ctv-block-title">Evaluaciones</div>
                  {modulo.evaluaciones.map(ev => (
                    <div key={ev.id} className="ctv-evaluacion">
                      <div className="ctv-evaluacion-header" onClick={() => setSelectedNodo(selectedNodo === ev.id ? null : ev.id)}>
                        <span className="ctv-evaluacion-icon"><FiCheckCircle /></span>
                        <span className="ctv-evaluacion-title">{ev.nombre}</span>
                        {selectedNodo === ev.id ? <FiChevronDown /> : <FiChevronRight />}
                      </div>
                      {selectedNodo === ev.id && (
                        <LeccionContent cursoId={cursoId} nodoId={ev.id} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 