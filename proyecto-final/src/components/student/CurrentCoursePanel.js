import React, { useState, useEffect } from 'react';
import { FiPlay, FiCheck, FiLock, FiClock } from 'react-icons/fi';
import './CurrentCoursePanel.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function CurrentCoursePanel({ course, progresoLecciones = [], onProgresoUpdate }) {
  const [modulos, setModulos] = useState([]);
  const [lecciones, setLecciones] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (course) {
      cargarModulosYLecciones();
    }
  }, [course]);

  const cargarModulosYLecciones = async () => {
    try {
      setLoading(true);
      
      // Cargar módulos del curso
      const modulosResponse = await fetch(`${API_BASE_URL}/cursos/${course.ID_Curso}/modulos`);
      if (!modulosResponse.ok) throw new Error('Error al cargar módulos');
      const modulosData = await modulosResponse.json();
      setModulos(modulosData);

      // Cargar lecciones de cada módulo
      const leccionesData = {};
      for (const modulo of modulosData) {
        const leccionesResponse = await fetch(`${API_BASE_URL}/modulos/${modulo.ID_Modulo}/lecciones`);
        if (leccionesResponse.ok) {
          const leccionesModulo = await leccionesResponse.json();
          leccionesData[modulo.ID_Modulo] = leccionesModulo;
        }
      }
      setLecciones(leccionesData);
    } catch (error) {
      console.error('Error cargando módulos y lecciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerProgresoLeccion = (leccionId) => {
    return progresoLecciones.find(p => p.ID_Leccion === leccionId) || null;
  };

  const marcarLeccionCompletada = async (leccionId, completado) => {
    if (onProgresoUpdate) {
      await onProgresoUpdate(leccionId, completado, 30); // 30 minutos por defecto
    }
  };

  const obtenerEstadoLeccion = (leccion, moduloIndex, leccionIndex) => {
    const progreso = obtenerProgresoLeccion(leccion.ID_Leccion);
    
    if (progreso && progreso.Completado) {
      return 'completed';
    }
    
    // Verificar si la lección anterior está completada
    if (leccionIndex > 0) {
      const leccionAnterior = lecciones[leccion.ID_Modulo][leccionIndex - 1];
      const progresoAnterior = obtenerProgresoLeccion(leccionAnterior.ID_Leccion);
      if (!progresoAnterior || !progresoAnterior.Completado) {
        return 'locked';
      }
    } else if (moduloIndex > 0) {
      // Verificar si el módulo anterior está completado
      const moduloAnterior = modulos[moduloIndex - 1];
      const leccionesModuloAnterior = lecciones[moduloAnterior.ID_Modulo] || [];
      const todasCompletadas = leccionesModuloAnterior.every(l => {
        const p = obtenerProgresoLeccion(l.ID_Leccion);
        return p && p.Completado;
      });
      if (!todasCompletadas) {
        return 'locked';
      }
    }
    
    return 'available';
  };

  const renderIcon = (estado) => {
    switch (estado) {
      case 'completed':
        return <FiCheck className="icon completed" />;
      case 'locked':
        return <FiLock className="icon locked" />;
      default:
        return <FiPlay className="icon available" />;
    }
  };

  if (loading) {
    return (
      <div className="current-course-panel">
        <div className="panel-header">
          <h3>Curso Actual</h3>
        </div>
        <div className="loading">Cargando contenido del curso...</div>
      </div>
    );
  }

  return (
    <div className="current-course-panel">
      <div className="panel-header">
        <h3>{course?.name || 'Curso Actual'}</h3>
        <div className="course-info">
          <span className="progress-text">Progreso: {Math.round(Math.min(course?.progress || 0, 100))}%</span>
        </div>
      </div>
      
      <div className="course-content">
        {modulos.map((modulo, moduloIndex) => (
          <div key={modulo.ID_Modulo} className="module-section">
            <div className="module-header">
              <h4>Módulo {modulo.Orden}: {modulo.Nombre}</h4>
              <span className="module-duration">
                <FiClock /> {modulo.Duracion_estimada || 0} min
              </span>
            </div>
            
            <div className="lessons-list">
              {lecciones[modulo.ID_Modulo]?.map((leccion, leccionIndex) => {
                const estado = obtenerEstadoLeccion(leccion, moduloIndex, leccionIndex);
                const progreso = obtenerProgresoLeccion(leccion.ID_Leccion);
                
                return (
                  <div 
                    key={leccion.ID_Leccion} 
                    className={`lesson-item ${estado}`}
                  >
                    <div className="lesson-info">
                      {renderIcon(estado)}
                      <div className="lesson-details">
                        <span className="lesson-name">
                          Lección {leccion.Orden}: {leccion.Nombre}
                        </span>
                        <span className="lesson-duration">
                          {leccion.Duracion_estimada || 0} min
                        </span>
                      </div>
                    </div>
                    
                    <div className="lesson-actions">
                      {estado === 'completed' && (
                        <span className="completion-status">
                          Completada {progreso?.Fecha_ultimo_acceso && 
                            new Date(progreso.Fecha_ultimo_acceso).toLocaleDateString()}
                        </span>
                      )}
                      
                      {estado === 'available' && (
                        <button 
                          className="btn-start-lesson"
                          onClick={() => marcarLeccionCompletada(leccion.ID_Leccion, true)}
                        >
                          Comenzar
                        </button>
                      )}
                      
                      {estado === 'locked' && (
                        <span className="locked-message">
                          Completa la lección anterior
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {modulos.length === 0 && (
        <div className="no-content">
          <p>No hay contenido disponible para este curso.</p>
        </div>
      )}
    </div>
  );
} 