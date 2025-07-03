// Archivo eliminado. Reemplazado por TeacherEvaluations.js
// Archivo obsoleto. Reemplazado por TeacherEvaluations.js
import React, { useState } from 'react';
import { FiSearch, FiDownload, FiUpload } from 'react-icons/fi';
import './GradeManager.css';

function GradeManager({ teacherData }) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [grades] = useState([
    {
      id: 1,
      student: 'Ana García',
      course: 'Matemáticas Avanzadas',
      evaluation: 'Quiz Módulo 1',
      grade: 85,
      maxGrade: 100,
      submittedAt: '2024-01-15'
    },
    {
      id: 2,
      student: 'Carlos López',
      course: 'Cálculo Diferencial',
      evaluation: 'Examen Parcial',
      grade: 72,
      maxGrade: 100,
      submittedAt: '2024-01-14'
    }
  ]);

  const filteredGrades = grades.filter(grade =>
    (selectedCourse === '' || grade.course === selectedCourse) &&
    (grade.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
     grade.evaluation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return '#48bb78';
    if (percentage >= 80) return '#38a169';
    if (percentage >= 70) return '#ecc94b';
    if (percentage >= 60) return '#ed8936';
    return '#e53e3e';
  };

  return (
    <div className="grade-manager">
      <div className="grade-header">
        <h2>Gestión de Calificaciones</h2>
        <div className="grade-actions">
          <button className="action-btn">
            <FiDownload /> Exportar
          </button>
          <button className="action-btn">
            <FiUpload /> Importar
          </button>
        </div>
      </div>

      <div className="grade-filters">
        <div className="filter-group">
          <label>Filtrar por curso:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Todos los cursos</option>
            {(teacherData && Array.isArray(teacherData.courses) ? teacherData.courses : []).map(course => (
              <option key={course.id} value={course.name}>{course.name}</option>
            ))}
          </select>
        </div>
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por estudiante o evaluación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="grades-table-container">
        <table className="grades-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Evaluación</th>
              <th>Calificación</th>
              <th>Porcentaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(filteredGrades || []).map(grade => (
              <tr key={grade.id}>
                <td>
                  <div className="student-info">
                    <div className="student-avatar">
                      {grade.student.charAt(0)}
                    </div>
                    <span>{grade.student}</span>
                  </div>
                </td>
                <td>{grade.course}</td>
                <td>{grade.evaluation}</td>
                <td>
                  <span 
                    className="grade-value"
                    style={{ color: getGradeColor(grade.grade, grade.maxGrade) }}
                  >
                    {grade.grade}/{grade.maxGrade}
                  </span>
                </td>
                <td>
                  <div className="percentage-bar">
                    <div 
                      className="percentage-fill"
                      style={{ 
                        width: `${(grade.grade / grade.maxGrade) * 100}%`,
                        backgroundColor: getGradeColor(grade.grade, grade.maxGrade)
                      }}
                    ></div>
                    <span className="percentage-text">
                      {Math.round((grade.grade / grade.maxGrade) * 100)}%
                    </span>
                  </div>
                </td>
                <td>{grade.submittedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredGrades.length === 0 && (
        <div className="empty-state">
          <p>No se encontraron calificaciones que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}

export default GradeManager; 