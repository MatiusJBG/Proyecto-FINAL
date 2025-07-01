import React, { useState } from 'react';
import { FiSearch, FiMail, FiEye } from 'react-icons/fi';
import './StudentManager.css';

function StudentManager({ teacherData }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos simulados de estudiantes
  const [students] = useState([
    {
      id: 1,
      name: 'Ana García',
      email: 'ana.garcia@estudiante.edu',
      course: 'Matemáticas Avanzadas',
      progress: 85,
      lastActivity: '2024-01-15'
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos.lopez@estudiante.edu',
      course: 'Cálculo Diferencial',
      progress: 72,
      lastActivity: '2024-01-14'
    },
    {
      id: 3,
      name: 'María Rodríguez',
      email: 'maria.rodriguez@estudiante.edu',
      course: 'Matemáticas Avanzadas',
      progress: 90,
      lastActivity: '2024-01-15'
    }
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="student-manager">
      <div className="student-header">
        <h2>Gestión de Estudiantes</h2>
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar estudiantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Progreso</th>
              <th>Última Actividad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>
                  <div className="student-info">
                    <div className="student-avatar">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="student-name">{student.name}</div>
                      <div className="student-email">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td>{student.course}</td>
                <td>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{student.progress}%</span>
                  </div>
                </td>
                <td>{student.lastActivity}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn" title="Ver perfil">
                      <FiEye />
                    </button>
                    <button className="action-btn" title="Enviar mensaje">
                      <FiMail />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="empty-state">
          <p>No se encontraron estudiantes que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
}

export default StudentManager; 