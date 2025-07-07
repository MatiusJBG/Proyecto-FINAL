import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiTrendingUp, FiBook, FiAward, FiClock, FiXCircle, FiAlertCircle, FiStar } from 'react-icons/fi';
import './ExamAttempt.css';

export default function ExamAttempt({ evaluacionId, estudianteId, cursoId, onFinish }) {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({}); // { [id_pregunta]: id_opcion }
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [progresoModulo, setProgresoModulo] = useState(null);
  const [progresoCurso, setProgresoCurso] = useState(null);
  const [intentos, setIntentos] = useState({ usados: 0, max: 1 });

  useEffect(() => {
    async function fetchPreguntas() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/evaluaciones/${evaluacionId}/preguntas`);
        if (!res.ok) throw new Error('No se pudieron cargar las preguntas');
        const data = await res.json();
        setPreguntas(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (evaluacionId) fetchPreguntas();
  }, [evaluacionId]);

  useEffect(() => {
    async function fetchIntentos() {
      if (evaluacionId && estudianteId) {
        const res = await fetch(`/api/evaluaciones/${evaluacionId}/intentos/${estudianteId}`);
        const data = await res.json();
        setIntentos(data);
      }
    }
    fetchIntentos();
  }, [evaluacionId, estudianteId]);

  const handleChange = (idPregunta, idOpcion) => {
    setRespuestas({ ...respuestas, [idPregunta]: idOpcion });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        estudiante_id: estudianteId,
        respuestas: preguntas.map(p => ({
          id_pregunta: p.id || p.ID_Pregunta,
          id_opcion: respuestas[p.id || p.ID_Pregunta]
        }))
      };
      const res = await fetch(`/api/evaluaciones/${evaluacionId}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al enviar respuestas');
      
      const resultadoData = await res.json();
      setResultado(resultadoData);
      setEnviado(true);
      
      // Cargar progreso actualizado
      await cargarProgreso();
      
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarProgreso = async () => {
    try {
      // Cargar progreso del módulo
      const resModulo = await fetch(`/api/estudiante/${estudianteId}/curso/${cursoId}/progreso-modulo`);
      if (resModulo.ok) {
        const progresoMod = await resModulo.json();
        setProgresoModulo(progresoMod);
      }
      
      // Cargar progreso del curso
      const resCurso = await fetch(`/api/estudiante/${estudianteId}/curso/${cursoId}/progreso`);
      if (resCurso.ok) {
        const progresoCur = await resCurso.json();
        setProgresoCurso(progresoCur);
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10b981'; // Verde
    if (progress >= 60) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  };

  const getProgressText = (progress) => {
    if (progress >= 80) return 'Excelente';
    if (progress >= 60) return 'Bueno';
    if (progress >= 40) return 'Regular';
    return 'Necesita mejorar';
  };

  const getProgressIcon = (progress) => {
    if (progress >= 80) return <FiStar size={20} color="#10b981" />;
    if (progress >= 60) return <FiTrendingUp size={20} color="#f59e0b" />;
    return <FiAlertCircle size={20} color="#ef4444" />;
  };

  const getMensajeRecomendacion = (puntaje) => {
    if (puntaje < 50) {
      return {
        titulo: "Necesitas mejorar",
        mensaje: "Tus resultados muestran dificultades. Te recomendamos repasar los módulos anteriores y pedir ayuda a tu docente.",
        color: "#ef4444",
        icono: <FiAlertCircle size={32} color="#ef4444" />
      };
    } else if (puntaje < 70) {
      return {
        titulo: "Vas mejorando",
        mensaje: "Vas mejorando, pero aún puedes reforzar conceptos clave. Repasa las lecciones y realiza ejercicios adicionales.",
        color: "#f59e0b",
        icono: <FiTrendingUp size={32} color="#f59e0b" />
      };
    } else if (puntaje < 85) {
      return {
        titulo: "¡Buen trabajo!",
        mensaje: "¡Buen trabajo! Has aprobado la evaluación. Sigue practicando para mejorar aún más.",
        color: "#10b981",
        icono: <FiCheckCircle size={32} color="#10b981" />
      };
    } else {
      return {
        titulo: "¡Excelente!",
        mensaje: "¡Excelente desempeño! Continúa así y desafíate con contenidos avanzados o ayuda a tus compañeros.",
        color: "#3b82f6",
        icono: <FiStar size={32} color="#3b82f6" />
      };
    }
  };

  if (loading && !enviado) return (
    <div className="exam-attempt loading">
      <div className="loading-spinner"></div>
      <p>Cargando evaluación...</p>
    </div>
  );
  
  if (error) return (
    <div className="exam-attempt error">
      <FiXCircle size={48} color="#ef4444" />
      <h3>Error</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Reintentar</button>
    </div>
  );
  
  if (enviado && resultado) {
    return (
      <div className="exam-attempt resultado">
        {/* Header del resultado */}
        <div className="resultado-header">
          <div className="resultado-icon">
            {resultado.aprobado ? (
              <FiCheckCircle size={64} color="#10b981" />
            ) : (
              <FiXCircle size={64} color="#ef4444" />
            )}
          </div>
          <h2 className="resultado-titulo">
            {resultado.aprobado ? '¡Evaluación Aprobada!' : 'Evaluación No Aprobada'}
          </h2>
          <div className="puntaje-container">
            <div className="puntaje-valor">{Math.round(resultado.puntaje || 0)}%</div>
            <div className="puntaje-label">Puntaje obtenido</div>
            <div className="puntaje-aprobacion">
              Puntaje mínimo: {Math.round(resultado.puntaje_aprobacion || 70)}%
            </div>
          </div>
        </div>

        {/* Estadísticas de la evaluación */}
        <div className="evaluacion-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FiCheckCircle size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{resultado.respuestas_correctas || 0}</div>
              <div className="stat-label">Respuestas correctas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiBook size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{resultado.total_preguntas || 0}</div>
              <div className="stat-label">Total de preguntas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiTrendingUp size={24} color="#8b5cf6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {resultado.total_preguntas > 0 
                  ? Math.round((resultado.respuestas_correctas / resultado.total_preguntas) * 100)
                  : 0}%
              </div>
              <div className="stat-label">Porcentaje de acierto</div>
            </div>
          </div>
        </div>

        {/* Progreso del Módulo */}
        {progresoModulo && (
          <div className="progreso-seccion">
            <div className="seccion-header">
              <FiBook size={24} color="#3b82f6" />
              <h3>Progreso del Módulo Actual</h3>
            </div>
            <div className="progreso-card">
              <div className="progreso-header">
                <div className="progreso-info">
                  <h4 className="progreso-titulo">{progresoModulo.nombre_modulo || 'Módulo Actual'}</h4>
                  <p className="progreso-descripcion">Tu progreso en este módulo</p>
                </div>
                <div className="progreso-porcentaje">
                  <span className="porcentaje-valor">{Math.round(progresoModulo.progreso || 0)}%</span>
                  {getProgressIcon(progresoModulo.progreso || 0)}
                </div>
              </div>
              <div className="progreso-bar-container">
                <div className="progreso-bar-background">
                  <div 
                    className="progreso-bar-fill" 
                    style={{ 
                      width: `${progresoModulo.progreso || 0}%`,
                      backgroundColor: getProgressColor(progresoModulo.progreso || 0)
                    }}
                  />
                </div>
                <div className="progreso-text">{getProgressText(progresoModulo.progreso || 0)}</div>
              </div>
              <div className="progreso-stats">
                <div className="stat-item">
                  <FiBook size={16} color="#6b7280" />
                  <span className="stat-text">
                    <strong>{progresoModulo.lecciones_completadas || 0}</strong> de <strong>{progresoModulo.total_lecciones || 0}</strong> lecciones completadas
                  </span>
                </div>
                <div className="stat-item">
                  <FiAward size={16} color="#6b7280" />
                  <span className="stat-text">
                    <strong>{progresoModulo.evaluaciones_aprobadas || 0}</strong> de <strong>{progresoModulo.total_evaluaciones || 0}</strong> evaluaciones aprobadas
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progreso del Curso */}
        {progresoCurso && (
          <div className="progreso-seccion">
            <div className="seccion-header">
              <FiTrendingUp size={24} color="#10b981" />
              <h3>Progreso General del Curso</h3>
            </div>
            <div className="progreso-card">
              <div className="progreso-header">
                <div className="progreso-info">
                  <h4 className="progreso-titulo">{progresoCurso.nombre_curso || 'Curso Actual'}</h4>
                  <p className="progreso-descripcion">Tu progreso general en el curso</p>
                </div>
                <div className="progreso-porcentaje">
                  <span className="porcentaje-valor">{Math.round(progresoCurso.progreso_total || 0)}%</span>
                  {getProgressIcon(progresoCurso.progreso_total || 0)}
                </div>
              </div>
              <div className="progreso-bar-container">
                <div className="progreso-bar-background">
                  <div 
                    className="progreso-bar-fill" 
                    style={{ 
                      width: `${progresoCurso.progreso_total || 0}%`,
                      backgroundColor: getProgressColor(progresoCurso.progreso_total || 0)
                    }}
                  />
                </div>
                <div className="progreso-text">{getProgressText(progresoCurso.progreso_total || 0)}</div>
              </div>
              <div className="progreso-stats">
                <div className="stat-item">
                  <FiBook size={16} color="#6b7280" />
                  <span className="stat-text">
                    <strong>{progresoCurso.modulos_completados || 0}</strong> de <strong>{progresoCurso.total_modulos || 0}</strong> módulos con progreso
                  </span>
                </div>
                <div className="stat-item">
                  <FiTrendingUp size={16} color="#6b7280" />
                  <span className="stat-text">
                    Promedio de evaluaciones: <strong>{Math.round(progresoCurso.promedio_evaluaciones || 0)}%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje motivacional */}
        <div className="mensaje-motivacional">
          {(() => {
            const recomendacion = getMensajeRecomendacion(resultado.puntaje || 0);
            return (
              <div className="mensaje-recomendacion" style={{ borderColor: recomendacion.color }}>
                <div className="mensaje-icon">
                  {recomendacion.icono}
                </div>
                <div className="mensaje-content">
                  <h4>{recomendacion.titulo}</h4>
                  <p>{recomendacion.mensaje}</p>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="resultado-actions">
          <button 
            className="btn-continuar" 
            onClick={() => {
              if (onFinish) onFinish(resultado.puntaje);
            }}
          >
            Continuar al Curso
          </button>
        </div>
      </div>
    );
  }

  // Mostrar intentos antes de empezar
  if (!enviado) {
    if (intentos.max - intentos.usados <= 0) {
      return (
        <div className="exam-attempt error">
          <FiAlertCircle size={48} color="#ef4444" />
          <h3>Has alcanzado el máximo de intentos permitidos para esta evaluación.</h3>
          <p>No puedes volver a intentarla.</p>
          <button onClick={onFinish}>Volver</button>
        </div>
      );
    }
  }

  return (
    <form className="exam-attempt" onSubmit={handleSubmit}>
      <div className="exam-header">
        <div className="exam-title">
          <FiBook size={24} color="#3b82f6" />
          <h3>Evaluación</h3>
        </div>
        <div className="exam-info">
          <div className="info-item">
            <FiBook size={16} color="#6b7280" />
            <span>{preguntas.length} preguntas</span>
          </div>
          <div className="info-divider">•</div>
          <div className="info-item">
            <FiClock size={16} color="#6b7280" />
            <span>Tiempo estimado: {Math.ceil(preguntas.length * 2)} min</span>
          </div>
          <div className="info-divider">•</div>
          <div className="info-item">
            <FiTrendingUp size={16} color="#10b981" />
            <span>Intentos usados: {intentos.usados} / {intentos.max}</span>
          </div>
        </div>
      </div>
      
      <div className="preguntas-container">
        {preguntas.map((p, index) => (
        <div key={p.id || p.ID_Pregunta} className="pregunta-item">
            <div className="pregunta-header">
              <span className="pregunta-numero">Pregunta {index + 1}</span>
              <span className="pregunta-tipo">Selección múltiple</span>
            </div>
            <div className="pregunta-content">
              <label className="pregunta-texto">{p.texto || p.Texto}</label>
          {p.opciones && p.opciones.length > 0 ? (
            <div className="opciones-list">
                  {p.opciones.map((op, opIndex) => (
                <label key={op.id || op.ID_Opcion} className="opcion-item">
                  <input
                    type="radio"
                    name={`pregunta_${p.id || p.ID_Pregunta}`}
                    value={op.id || op.ID_Opcion}
                    checked={respuestas[p.id || p.ID_Pregunta] === (op.id || op.ID_Opcion)}
                    onChange={() => handleChange(p.id || p.ID_Pregunta, op.id || op.ID_Opcion)}
                    required
                  />
                      <div className="opcion-content">
                        <span className="opcion-letra">{String.fromCharCode(65 + opIndex)}</span>
                        <span className="opcion-texto">{op.texto || op.Texto}</span>
                      </div>
                </label>
              ))}
                </div>
              ) : (
                <div className="no-opciones">
                  <FiAlertCircle size={16} color="#ef4444" />
                  <span>Sin opciones disponibles</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="exam-actions">
        <div className="progress-indicator">
          <span className="progress-text">
            {Object.keys(respuestas).length} de {preguntas.length} preguntas respondidas
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(Object.keys(respuestas).length / preguntas.length) * 100}%` }}
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="btn-enviar"
          disabled={loading || Object.keys(respuestas).length < preguntas.length}
        >
          {loading ? (
            <>
              <div className="loading-spinner-small"></div>
              Enviando...
            </>
          ) : (
            'Enviar Respuestas'
          )}
        </button>
        </div>
    </form>
  );
}
