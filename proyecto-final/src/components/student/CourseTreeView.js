import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronRight, FiBookOpen, FiFileText, FiCheckCircle } from 'react-icons/fi';
import './CourseTreeView.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function CourseTreeView({ cursoId, onStartEvaluation }) {
  const [modulos, setModulos] = useState([]);
  const [expandedModulos, setExpandedModulos] = useState({});
  const [expandedLecciones, setExpandedLecciones] = useState({});

  useEffect(() => {
    if (cursoId) {
      fetch(`${API_BASE_URL}/cursos/${cursoId}/modulos`)
        .then(res => res.json())
        .then(data => setModulos(data))
        .catch(() => setModulos([]));
    }
  }, [cursoId]);

  const toggleModulo = (moduloId) => {
    setExpandedModulos(prev => ({ ...prev, [moduloId]: !prev[moduloId] }));
  };
  const toggleLeccion = (leccionId) => {
    setExpandedLecciones(prev => ({ ...prev, [leccionId]: !prev[leccionId] }));
  };

  if (!modulos) return <div className="ctv-root">Cargando estructura...</div>;

  return (
    <div className="ctv-root">
      <div className="ctv-title">Estructura del Curso</div>
      {modulos.map(modulo => (
        <div className="ctv-modulo" key={modulo.ID_Modulo}>
          <div className="ctv-modulo-header" onClick={() => toggleModulo(modulo.ID_Modulo)}>
            {expandedModulos[modulo.ID_Modulo] ? <FiChevronDown /> : <FiChevronRight />}
            <span className="ctv-modulo-title">{modulo.Nombre}</span>
            <span className="ctv-modulo-desc">{modulo.Descripcion}</span>
          </div>
          {expandedModulos[modulo.ID_Modulo] && (
            <div className="ctv-modulo-body">
              {/* Lecciones */}
              {modulo.lecciones && modulo.lecciones.length > 0 && (
                <div className="ctv-lecciones-block">
                  <div className="ctv-block-title">Lecciones</div>
                  {modulo.lecciones.map(leccion => (
                    <div key={leccion.ID_Leccion} className="ctv-leccion">
                      <div className="ctv-leccion-header" onClick={() => toggleLeccion(leccion.ID_Leccion)}>
                        <span className="ctv-leccion-icon"><FiBookOpen /></span>
                        <span className="ctv-leccion-title">{leccion.Nombre}</span>
                        {expandedLecciones[leccion.ID_Leccion] ? <FiChevronDown /> : <FiChevronRight />}
                      </div>
                      {expandedLecciones[leccion.ID_Leccion] && (
                        <div className="ctv-leccion-content">
                          <div><b>Descripción:</b> {leccion.Descripcion}</div>
                          <div><b>Contenido:</b> {leccion.Contenido}</div>
                          {/* Evaluaciones de la lección */}
                          {leccion.evaluaciones && leccion.evaluaciones.length > 0 && (
                            <div className="ctv-evaluaciones-block">
                              <div className="ctv-block-title">Evaluaciones</div>
                              {leccion.evaluaciones.map(ev => (
                                <div key={ev.ID_Evaluacion} className="ctv-evaluacion">
                                  <span className="ctv-evaluacion-icon"><FiFileText /></span>
                                  <span className="ctv-evaluacion-title">{ev.Nombre}</span>
                                  <button onClick={() => onStartEvaluation && onStartEvaluation(ev.ID_Evaluacion)}>
                                    Presentar
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Evaluaciones del módulo */}
              {modulo.evaluaciones_modulo && modulo.evaluaciones_modulo.length > 0 && (
                <div className="ctv-evaluaciones-block">
                  <div className="ctv-block-title">Evaluaciones del Módulo</div>
                  {modulo.evaluaciones_modulo.map(ev => (
                    <div key={ev.ID_Evaluacion} className="ctv-evaluacion">
                      <span className="ctv-evaluacion-icon"><FiCheckCircle /></span>
                      <span className="ctv-evaluacion-title">{ev.Nombre}</span>
                      <button onClick={() => onStartEvaluation && onStartEvaluation(ev.ID_Evaluacion)}>
                        Presentar
                      </button>
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