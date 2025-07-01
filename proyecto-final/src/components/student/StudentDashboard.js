import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Sidebar from './Sidebar';
import UserHeader from './UserHeader';
import CourseProgress from './CourseProgress';
import CurrentCoursePanel from './CurrentCoursePanel';
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

export default function StudentDashboard({ onLogout, userData }) {
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
      <Sidebar onLogout={onLogout} />
      <main className="dashboard-main">
        <UserHeader userData={userData} />
        <section className="dashboard-panels">
          <div className="panel panel-progress">
            <CourseProgress progress={mockCourse.progress} />
          </div>
          <CurrentCoursePanel course={mockCourse} />
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