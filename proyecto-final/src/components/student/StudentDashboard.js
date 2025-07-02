import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiBook, FiAward, FiClock } from 'react-icons/fi';
import Sidebar from './Sidebar';
import UserHeader from './UserHeader';
import CourseProgress from './CourseProgress';
import CurrentCoursePanel from './CurrentCoursePanel';
import RecommendationCard from './RecommendationCard';
import PendingEvaluations from './PendingEvaluations';
import NotificationPanel from './NotificationPanel';
import CourseEnrollment from './CourseEnrollment';
import CourseTreeView from './CourseTreeView';
import './StudentDashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function StudentDashboard({ onLogout, userData }) {
  const [cursosMatriculados, setCursosMatriculados] = useState([]);
  const [cursoActual, setCursoActual] = useState(null);
  const [progresoLecciones, setProgresoLecciones] = useState([]);
  const [evaluacionesPendientes, setEvaluacionesPendientes] = useState([]);
  const [resultadosEvaluaciones, setResultadosEvaluaciones] = useState([]);
  const [recomendacion, setRecomendacion] = useState({});
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('cursos');
  const [panelCursoAbierto, setPanelCursoAbierto] = useState(false);

  useEffect(() => {
    if (userData && userData.ID_Estudiante) {
      cargarDatosEstudiante();
    }
  }, [userData]);

  const cargarDatosEstudiante = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarCursosMatriculados(),
        cargarEstadisticas(),
        cargarRecomendacion()
      ]);
    } catch (error) {
      console.error('Error cargando datos del estudiante:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarCursosMatriculados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/estudiante/${userData.ID_Estudiante}/cursos`);
      if (!response.ok) throw new Error('Error al cargar cursos');
      
      const cursos = await response.json();
      setCursosMatriculados(cursos);
      
      // Seleccionar el primer curso como actual
      if (cursos.length > 0) {
        setCursoActual(cursos[0]);
        await cargarProgresoLecciones(cursos[0].ID_Curso);
        await cargarEvaluacionesPendientes(cursos[0].ID_Curso);
        await cargarResultadosEvaluaciones(cursos[0].ID_Curso);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
    }
  };

  const cargarProgresoLecciones = async (cursoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/estudiante/${userData.ID_Estudiante}/progreso-lecciones?curso_id=${cursoId}`);
      if (!response.ok) throw new Error('Error al cargar progreso');
      
      const progreso = await response.json();
      setProgresoLecciones(progreso);
    } catch (error) {
      console.error('Error cargando progreso:', error);
    }
  };

  const cargarEvaluacionesPendientes = async (cursoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cursos/${cursoId}/evaluaciones`);
      if (!response.ok) throw new Error('Error al cargar evaluaciones');
      
      const evaluaciones = await response.json();
      setEvaluacionesPendientes(evaluaciones);
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
    }
  };

  const cargarResultadosEvaluaciones = async (cursoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/estudiante/${userData.ID_Estudiante}/resultados-evaluaciones?curso_id=${cursoId}`);
      if (!response.ok) throw new Error('Error al cargar resultados');
      
      const resultados = await response.json();
      setResultadosEvaluaciones(resultados);
    } catch (error) {
      console.error('Error cargando resultados:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/estudiante/${userData.ID_Estudiante}/estadisticas`);
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      
      const stats = await response.json();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cargarRecomendacion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/estudiante/${userData.ID_Estudiante}/generar-recomendacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Error al generar recomendación');
      
      const rec = await response.json();
      setRecomendacion({
        message: rec.accion,
        reason: `Basado en tu ${rec.tipo}`,
        icon: rec.tipo === 'refuerzo' ? <FiAlertCircle /> : <FiCheckCircle />,
        tipo: rec.tipo,
        prioridad: rec.prioridad
      });
    } catch (error) {
      console.error('Error generando recomendación:', error);
      // Recomendación por defecto
      setRecomendacion({
        message: 'Continúa con tu aprendizaje',
        reason: 'Basado en tu progreso general',
        icon: <FiBook />,
        tipo: 'general',
        prioridad: 'baja'
      });
    }
  };

  const actualizarProgresoLeccion = async (leccionId, completado, tiempoDedicado = 0) => {
    try {
      const response = await fetch(`${API_BASE_URL}/progreso-leccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: userData.ID_Estudiante,
          leccion_id: leccionId,
          completado: completado,
          tiempo_dedicado: tiempoDedicado
        })
      });
      
      if (!response.ok) throw new Error('Error al actualizar progreso');
      
      // Recargar datos
      if (cursoActual) {
        await cargarProgresoLecciones(cursoActual.ID_Curso);
        await cargarCursosMatriculados();
        await cargarEstadisticas();
      }
    } catch (error) {
      console.error('Error actualizando progreso:', error);
    }
  };

  const registrarResultadoEvaluacion = async (evaluacionId, puntaje, tiempoUtilizado = 0) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resultado-evaluacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: userData.ID_Estudiante,
          evaluacion_id: evaluacionId,
          puntaje: puntaje,
          tiempo_utilizado: tiempoUtilizado
        })
      });
      
      if (!response.ok) throw new Error('Error al registrar resultado');
      
      // Recargar datos
      if (cursoActual) {
        await cargarResultadosEvaluaciones(cursoActual.ID_Curso);
        await cargarEstadisticas();
        await cargarRecomendacion();
      }
    } catch (error) {
      console.error('Error registrando resultado:', error);
    }
  };

  const handleCursoClick = (curso) => {
    if (cursoActual && cursoActual.ID_Curso === curso.ID_Curso && panelCursoAbierto) {
      setPanelCursoAbierto(false);
    } else {
      setCursoActual(curso);
      setPanelCursoAbierto(true);
      cargarProgresoLecciones(curso.ID_Curso);
      cargarEvaluacionesPendientes(curso.ID_Curso);
      cargarResultadosEvaluaciones(curso.ID_Curso);
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

  const cursoMock = cursoActual ? {
    name: cursoActual.Nombre,
    currentModule: 'Módulo actual',
    currentLesson: 'Lección actual',
    progress: cursoActual.Progreso_total || 0,
  } : null;

  const evaluacionesMock = evaluacionesPendientes.map(evaluacion => ({
    id: evaluacion.ID_Evaluacion,
    name: evaluacion.Nombre,
    status: 'pending',
    contexto: evaluacion.Contexto_Nombre
  }));

  const notificacionesMock = [
    { 
      id: 1, 
      message: `Tienes ${evaluacionesPendientes.length} evaluaciones pendientes.`, 
      type: 'task' 
    },
    { 
      id: 2, 
      message: `Tu progreso promedio es del ${Math.round(estadisticas.promedio_progreso || 0)}%.`, 
      type: 'progress' 
    }
  ];

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} userData={userData} onSelectSection={setActiveSection} activeSection={activeSection} />
      <main className="dashboard-main">
        <UserHeader userData={userData} />
        {activeSection === 'cursos' && (
          <section className="course-selector">
            <h3>Mis Cursos</h3>
            <div className="course-list">
              {cursosMatriculados.map(curso => (
                <button
                  key={curso.ID_Curso}
                  className={`course-item ${cursoActual?.ID_Curso === curso.ID_Curso && panelCursoAbierto ? 'active' : ''}`}
                  onClick={() => handleCursoClick(curso)}
                >
                  <div className="course-info">
                    <h4>{curso.Nombre}</h4>
                    <p>Progreso: {Math.round(curso.Progreso_total || 0)}%</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
        {activeSection === 'matriculas' && (
          <CourseEnrollment 
            userData={userData} 
            onEnrollmentComplete={cargarDatosEstudiante}
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
              <CurrentCoursePanel 
                course={cursoMock} 
                progresoLecciones={progresoLecciones}
                onProgresoUpdate={actualizarProgresoLeccion}
              />
              <div className="panel panel-recommendation">
                <RecommendationCard recommendation={recomendacion} />
              </div>
            </div>
            <CourseTreeView cursoId={cursoActual.ID_Curso} />
            <section className="dashboard-lists">
              <PendingEvaluations 
                evaluations={evaluacionesMock}
                onEvaluationComplete={registrarResultadoEvaluacion}
              />
              <NotificationPanel notifications={notificacionesMock} />
            </section>
          </section>
        )}
        {activeSection === 'notificaciones' && (
          <NotificationPanel notifications={notificacionesMock} />
        )}
      </main>
    </div>
  );
} 