import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronRight, FiBook, FiFileText, FiCheckSquare } from 'react-icons/fi';
import CourseHierarchyManager from './CourseHierarchyManager';
import Notification from '../Notification';
import './CourseManagementPage.css';

function CourseManagementPage({ course, onBack }) {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className="course-management-page">
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          <FiArrowLeft />
          Volver a Mis Cursos
        </button>
        <h1>Gestión del Curso: {course.name}</h1>
      </div>

      <div className="course-info">
        <div className="course-details">
          <h3>Información del Curso</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Nombre:</span>
              <span className="value">{course.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Descripción:</span>
              <span className="value">{course.description || 'Sin descripción'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Duración estimada:</span>
              <span className="value">{course.duration} horas</span>
            </div>
            <div className="detail-item">
              <span className="label">Estado:</span>
              <span className={`status-badge ${course.status}`}>
                {course.status === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Estudiantes matriculados:</span>
              <span className="value">{course.totalStudents}</span>
            </div>
            <div className="detail-item">
              <span className="label">Módulos:</span>
              <span className="value">{course.totalModules}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="course-content">
        <CourseHierarchyManager 
          course={course} 
          onNotification={showNotification}
        />
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={handleCloseNotification}
        />
      )}
    </div>
  );
}

export default CourseManagementPage; 