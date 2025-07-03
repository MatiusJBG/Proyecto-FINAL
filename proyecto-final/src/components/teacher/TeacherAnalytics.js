import React from 'react';
import './TeacherAnalytics.css';

function TeacherAnalytics({ teacherId, stats }) {
  return (
    <section className="teacher-analytics">
      <h3>Analíticas</h3>
      {stats ? (
        <div>
          <div>Cursos activos: {stats.courses.active}</div>
          <div>Estudiantes totales: {stats.students.total}</div>
          <div>Promedio de progreso: {stats.students.averageProgress}%</div>
          <div>Evaluaciones totales: {stats.evaluations.total}</div>
        </div>
      ) : (
        <div>No hay estadísticas disponibles.</div>
      )}
    </section>
  );
}

export default TeacherAnalytics;
