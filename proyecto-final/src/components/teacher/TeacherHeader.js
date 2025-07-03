import React from 'react';
import './TeacherHeader.css';

function TeacherHeader({ teacherData }) {
  return (
    <header className="teacher-header">
      <div>
        <h2>Bienvenido, {teacherData.name}</h2>
        <span>{teacherData.department}</span>
      </div>
      <div className="teacher-header-actions">
        {/* Acciones rápidas o notificaciones aquí si se desea */}
      </div>
    </header>
  );
}

export default TeacherHeader;
