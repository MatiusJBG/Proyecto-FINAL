
import React from 'react';
import './CourseDetail.css';
import ModuleTree from './ModuleTree';

function CourseDetail({ course, onBack, teacherId }) {
  return (
    <div className="course-detail">
      <button className="back-btn" onClick={onBack}>← Volver a cursos</button>
      <h2>{course.Nombre}</h2>
      <div><b>Descripción:</b> {course.Descripcion || 'Sin descripción'}</div>
      <div><b>Fecha de creación:</b> {course.Fecha_creacion}</div>
      <h3>Jerarquía de módulos, lecciones y evaluaciones</h3>
      <ModuleTree courseId={course.ID_Curso} />
    </div>
  );
}

export default CourseDetail;
