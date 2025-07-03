
import React from 'react';
import './CourseDetail.css';
import ModuleManager from './ModuleManager';

function CourseDetail({ course, onBack, teacherId }) {
  return (
    <div className="course-detail">
      <button className="back-btn" onClick={onBack}>← Volver a cursos</button>
      <h2>{course.Nombre}</h2>
      <div><b>Descripción:</b> {course.Descripcion || 'Sin descripción'}</div>
      <div><b>Fecha de creación:</b> {course.Fecha_creacion}</div>
      
      {/* Gestión de módulos */}
      <ModuleManager courseId={course.ID_Curso} courseName={course.Nombre} />
    </div>
  );
}

export default CourseDetail;
