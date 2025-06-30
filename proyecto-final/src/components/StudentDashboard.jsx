import React, { useState, useEffect } from 'react';
import { FiUser, FiBook, FiBell, FiChevronRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import CourseProgress from './CourseProgress';
import RecommendationCard from './RecommendationCard';
import PendingEvaluations from './PendingEvaluations';
import NotificationPanel from './NotificationPanel';
import './StudentDashboard.css';

const mockStudent = { name: 'Luis' };
const mockCourse = {
  name: 'Matemáticas Avanzadas',
  currentModule: 'Álgebra',
  currentLesson: 'Ecuaciones cuadráticas',
  progress: 72,
};
const mockEvaluations = [
  { id: 1, name: 'Quiz Módulo 1', status: 'pending' },
  { id: 2, name: 'Tarea Módulo 2', status: 'feedback' },
];
const mockNotifications = [
  { id: 1, message: 'Tienes una tutoría programada para mañana.', type: 'reminder' },
  { id: 2, message: 'Nueva tarea disponible en el módulo 3.', type: 'task' },
];

export default function StudentDashboard() {
  const [score, setScore] = useState(58); // Simula score de evaluación
  const [recommendation, setRecommendation] = useState({});

  useEffect(() => {
    // Simula lógica de árbol de decisión
    if (score < 60) {
      setRecommendation({
        message: 'Te sugerimos repasar el módulo anterior',
        reason: 'Basado en tu puntaje en la evaluación anterior',
        icon: <FiAlertCircle />,
      });
    } else {
      setRecommendation({
        message: '¡Buen trabajo! Continúa con el siguiente módulo',
        reason: 'Tu desempeño ha sido excelente',
        icon: <FiCheckCircle />,
      });
    }
  }, [score]);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <FiUser size={32} />
          <span>Estudiante</span>
        </div>
        <nav>
          <ul>
            <li><FiBook /> Cursos</li>
            <li><FiBell /> Notificaciones</li>
          </ul>
        </nav>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>¡Hola, {mockStudent.name}!</h1>
        </header>
        <section className="dashboard-panels">
          <div className="panel panel-progress">
            <CourseProgress progress={mockCourse.progress} />
          </div>
          <div className="panel panel-current-course">
            <h2>Mi curso actual</h2>
            <p className="course-name">{mockCourse.name}</p>
            <p>Módulo: <b>{mockCourse.currentModule}</b></p>
            <p>Lección: <b>{mockCourse.currentLesson}</b></p>
            <button className="continue-btn"><FiChevronRight /> Continuar donde me quedé</button>
          </div>
          <div className="panel panel-recommendation">
            <RecommendationCard recommendation={recommendation} />
          </div>
        </section>
        <section className="dashboard-lists">
          <PendingEvaluations evaluations={mockEvaluations} />
          <NotificationPanel notifications={mockNotifications} />
        </section>
      </main>
    </div>
  );
} 