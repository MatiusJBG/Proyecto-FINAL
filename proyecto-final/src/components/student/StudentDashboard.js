import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiBook, FiAward, FiClock } from 'react-icons/fi';
import Sidebar from './Sidebar';
import UserHeader from './UserHeader';
import CourseProgress from './CourseProgress';
import RecommendationCard from './RecommendationCard';
import NotificationPanel from './NotificationPanel';
import CourseEnrollment from './CourseEnrollment';
import CourseTreeView from './CourseTreeView';
import ExamAttempt from './ExamAttempt';
import './StudentDashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function StudentDashboard({ onLogout, userData }) {
  const [cursosMatriculados, setCursosMatriculados] = useState([]);
  const [cursoActual, setCursoActual] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('cursos');
  const [panelCursoAbierto, setPanelCursoAbierto] = useState(false);
  const [evaluacionEnCurso, setEvaluacionEnCurso] = useState(null);

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
        cargarEstadisticas()
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

  const handleFinishEvaluation = () => {
    setEvaluacionEnCurso(null);
    cargarEstadisticas();
  };

  const handleEnrollmentComplete = async () => {
    await cargarDatosEstudiante();
    setActiveSection('cursos');
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
                      <p>Progreso: {Math.round(curso.Progreso_total || 0)}%</p>
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
                <RecommendationCard recommendation={{}} />
              </div>
            </div>
            {evaluacionEnCurso ? (
              <ExamAttempt 
                evaluacionId={evaluacionEnCurso} 
                estudianteId={userData.ID_Estudiante}
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