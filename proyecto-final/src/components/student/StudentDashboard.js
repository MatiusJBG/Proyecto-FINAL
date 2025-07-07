import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiBook, FiAward, FiClock, FiStar } from 'react-icons/fi';
import Sidebar from './Sidebar';
import UserHeader from './UserHeader';
import CourseProgress from './CourseProgress';
import RecommendationCard from './RecommendationCard';
import NotificationPanel from './NotificationPanel';
import CourseEnrollment from './CourseEnrollment';
import CourseTreeView from './CourseTreeView';
import ExamAttempt from './ExamAttempt';
import TeacherCoursesExplorer from './TeacherCoursesExplorer';
import CurrentCoursePanel from './CurrentCoursePanel';
import './StudentDashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Devuelve el mensaje visual y texto según el puntaje
 */
const getMensajeRecomendacion = (puntaje) => {
  if (puntaje < 50) {
    return {
      titulo: "Necesitas mejorar",
      mensaje: "Tus resultados muestran dificultades. Te recomendamos repasar los módulos anteriores y pedir ayuda a tu docente.",
      color: "#ef4444",
      icono: <span style={{color:'#ef4444',fontSize:24,marginRight:8}}>⬇️</span>
    };
  } else if (puntaje < 70) {
    return {
      titulo: "Vas mejorando",
      mensaje: "Vas mejorando, pero aún puedes reforzar conceptos clave. Repasa las lecciones y realiza ejercicios adicionales.",
      color: "#f59e0b",
      icono: <span style={{color:'#f59e0b',fontSize:24,marginRight:8}}>↗️</span>
    };
  } else if (puntaje < 85) {
    return {
      titulo: "¡Buen trabajo!",
      mensaje: "¡Buen trabajo! Has aprobado la evaluación. Sigue practicando para mejorar aún más.",
      color: "#10b981",
      icono: <span style={{color:'#10b981',fontSize:24,marginRight:8}}>✅</span>
    };
  } else {
    return {
      titulo: "¡Excelente!",
      mensaje: "¡Excelente desempeño! Continúa así y desafíate con contenidos avanzados o ayuda a tus compañeros.",
      color: "#3b82f6",
      icono: <span style={{color:'#3b82f6',fontSize:24,marginRight:8}}>⭐</span>
    };
  }
};

export default function StudentDashboard({ onLogout, userData }) {
  const [cursosMatriculados, setCursosMatriculados] = useState([]);
  const [cursoActual, setCursoActual] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('cursos');
  const [panelCursoAbierto, setPanelCursoAbierto] = useState(false);
  const [evaluacionEnCurso, setEvaluacionEnCurso] = useState(null);
  const [ultimoPuntaje, setUltimoPuntaje] = useState(null);

  useEffect(() => {
    if (userData && userData.ID_Estudiante) {
      cargarDatosEstudiante();
    }
  }, [userData]);

  useEffect(() => {
    const fetchUltimoPuntaje = async () => {
      try {
        const res = await fetch(`/api/estudiante/${userData.ID_Estudiante}/ultimo-puntaje`);
        const data = await res.json();
        setUltimoPuntaje(data.puntaje);
      } catch (e) {
        setUltimoPuntaje(null);
      }
    };
    fetchUltimoPuntaje();
  }, [userData.ID_Estudiante]);

  const cargarDatosEstudiante = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarCursosMatriculados(),
        cargarEstadisticas(),
        cargarRecomendaciones()
      ]);
    } catch (error) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarCursosMatriculados = async () => {
    try {
      const response = await fetch(`/api/estudiante/${userData.ID_Estudiante}/cursos`);
      if (!response.ok) throw new Error('Error al cargar cursos');
      const cursos = await response.json();
      setCursosMatriculados(cursos);
      if (cursos.length > 0) {
        setCursoActual(cursos[0]);
      } else {
        setCursoActual(null);
        setPanelCursoAbierto(false);
      }
    } catch (error) {
      setError('Error al cargar cursos');
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`/api/estudiante/${userData.ID_Estudiante}/estadisticas`);
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      const stats = await response.json();
      setEstadisticas(stats);
    } catch (error) {
      setError('Error al cargar estadísticas');
    }
  };

  const cargarRecomendaciones = async () => {
    try {
      // Fuerza la generación de una nueva recomendación antes de pedir el historial
      await fetch(`/api/estudiante/${userData.ID_Estudiante}/generar-recomendacion`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Sin puntaje específico para cargar recomendación general
      });

      const response = await fetch(`/api/estudiante/${userData.ID_Estudiante}/recomendaciones`);
      if (!response.ok) throw new Error('Error al cargar recomendaciones');
      const recs = await response.json();
      setRecomendaciones(recs);
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
    }
  };

  const handleCursoClick = (curso) => {
    if (cursoActual && cursoActual.ID_Curso === curso.ID_Curso && panelCursoAbierto) {
      setPanelCursoAbierto(false);
    } else {
      setCursoActual(curso);
      setPanelCursoAbierto(true);
    }
  };

  const handleStartEvaluation = (evaluacionId) => {
    setEvaluacionEnCurso(evaluacionId);
  };

  const handleFinishEvaluation = async (puntajeEvaluacion) => {
    setEvaluacionEnCurso(null);
    await generarRecomendacion(puntajeEvaluacion);
    await cargarEstadisticas();
    await cargarRecomendaciones();
    await cargarCursosMatriculados();
    // Actualizar el puntaje mostrado en el dashboard
    try {
      const res = await fetch(`/api/estudiante/${userData.ID_Estudiante}/ultimo-puntaje`);
      const data = await res.json();
      setUltimoPuntaje(data.puntaje);
    } catch (e) {
      setUltimoPuntaje(null);
    }
  };

  const handleProgresoLeccion = async (leccionId, completado, tiempo) => {
    try {
      await fetch('/api/progreso-leccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: userData.ID_Estudiante,
          leccion_id: leccionId,
          completado,
          tiempo_dedicado: tiempo || 30
        })
      });
      await generarRecomendacion(); // Sin puntaje específico para progreso de lección
      await cargarEstadisticas();
      await cargarRecomendaciones();
      await cargarCursosMatriculados();
    } catch (e) {
      // Manejo de error opcional
    }
  };

  const handleEnrollmentComplete = async () => {
    await cargarDatosEstudiante();
    setActiveSection('cursos');
  };

  const generarRecomendacion = async (puntajeEvaluacion) => {
    try {
      const body = puntajeEvaluacion !== undefined 
        ? { puntaje_evaluacion: puntajeEvaluacion }
        : {};
      
      await fetch(`/api/estudiante/${userData.ID_Estudiante}/generar-recomendacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      // No es crítico si falla
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar onLogout={onLogout} userData={userData} onSelectSection={setActiveSection} activeSection={activeSection} />
        <main className="dashboard-main">
          <div className="loading">Cargando datos del estudiante...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar onLogout={onLogout} userData={userData} onSelectSection={setActiveSection} activeSection={activeSection} />
        <main className="dashboard-main">
          <div className="error">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} userData={userData} onSelectSection={setActiveSection} activeSection={activeSection} />
      <main className="dashboard-main">
        <UserHeader userData={userData} />
        <div className="dashboard-tabs">
          <button
            className={activeSection === 'cursos' ? 'active' : ''}
            onClick={() => setActiveSection('cursos')}
          >
            Mis cursos
          </button>
          <button
            className={activeSection === 'matriculas' ? 'active' : ''}
            onClick={() => setActiveSection('matriculas')}
          >
            Matricularme
          </button>
          <button
            className={activeSection === 'explorar' ? 'active' : ''}
            onClick={() => setActiveSection('explorar')}
          >
            Explorar por Profesor
          </button>
        </div>
        {activeSection === 'cursos' && (
          <section className="course-selector">
            <h3>Mis Cursos</h3>
            <div className="course-list">
              {cursosMatriculados.length === 0 ? (
                <div className="no-courses">No estás matriculado en ningún curso.</div>
              ) : (
                cursosMatriculados.map(curso => (
                  <button
                    key={curso.ID_Curso}
                    className={`course-item ${cursoActual?.ID_Curso === curso.ID_Curso && panelCursoAbierto ? 'active' : ''}`}
                    onClick={() => handleCursoClick(curso)}
                  >
                    <div className="course-info">
                      <h4>{curso.Nombre}</h4>
                      <p>Progreso: {Math.round(Math.min(curso.Progreso_total || 0, 100))}%</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        )}
        {activeSection === 'matriculas' && (
          <CourseEnrollment 
            userData={userData} 
            onEnrollmentComplete={handleEnrollmentComplete}
          />
        )}
        {activeSection === 'explorar' && (
          <TeacherCoursesExplorer 
            userData={userData}
          />
        )}
        {activeSection === 'cursos' && panelCursoAbierto && cursoActual && (
          <section className="curso-panel-expandido">
            <div className="curso-panel-header">
              <h3>{cursoActual.Nombre}</h3>
              <button className="cerrar-panel" onClick={() => setPanelCursoAbierto(false)}>Cerrar</button>
            </div>
            <div className="dashboard-panels">
              <div className="panel panel-progress">
                <CourseProgress 
                  progress={cursoActual?.Progreso_total || 0} 
                  estadisticas={estadisticas}
                />
              </div>
              <div className="panel panel-recommendation">
                {ultimoPuntaje !== null ? (
                  (() => {
                    const mensaje = getMensajeRecomendacion(ultimoPuntaje);
                    return (
                      <>
                        <div className="mensaje-recomendacion" style={{ borderColor: mensaje.color, background: '#fff', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                          {mensaje.icono}
                          <div>
                            <h4 style={{margin:0, color:'#1f2937'}}>{mensaje.titulo}</h4>
                            <p style={{margin:0, color:'#6b7280'}}>{mensaje.mensaje}</p>
                            <div style={{marginTop:'0.5rem', color:'#6366f1', fontWeight:600}}>
                              Puntaje más reciente: <span style={{color:mensaje.color}}>{Math.round(ultimoPuntaje)}%</span>
                            </div>
                          </div>
                        </div>
                        {ultimoPuntaje >= 70 && (
                          <div className="mensaje-avance-modulo" style={{marginTop:'1.5rem', background:'#f0fdf4', border:'2px solid #10b981', borderRadius:'12px', padding:'1.25rem', color:'#065f46', fontWeight:500, display:'flex', alignItems:'center', gap:'0.75rem'}}>
                            <span style={{fontSize:22, color:'#10b981'}}>🚀</span>
                            ¡Felicidades! Has obtenido un buen puntaje. Te recomendamos avanzar al siguiente módulo para seguir aprendiendo.
                          </div>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <RecommendationCard 
                    recommendation={{
                      icon: '📚',
                      message: 'Continúa con tu progreso',
                      reason: 'Completa más lecciones para recibir recomendaciones personalizadas'
                    }} 
                  />
                )}
              </div>
            </div>
            <CurrentCoursePanel 
              course={cursoActual}
              onProgresoUpdate={handleProgresoLeccion}
            />
            {evaluacionEnCurso ? (
              <ExamAttempt 
                evaluacionId={evaluacionEnCurso} 
                estudianteId={userData.ID_Estudiante}
                cursoId={cursoActual.ID_Curso}
                onFinish={handleFinishEvaluation}
              />
            ) : (
              <CourseTreeView 
                cursoId={cursoActual.ID_Curso} 
                onStartEvaluation={handleStartEvaluation}
              />
            )}
          </section>
        )}
        {activeSection === 'notificaciones' && (
          <NotificationPanel notifications={[]} />
        )}
      </main>
    </div>
  );
} 