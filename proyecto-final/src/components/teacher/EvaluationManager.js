import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import './EvaluationManager.css';

function EvaluationManager({ teacherData }) {
  const [evaluations, setEvaluations] = useState([
    {
      id: 1,
      title: 'Quiz Módulo 1 - Álgebra',
      course: 'Matemáticas Avanzadas',
      type: 'Quiz',
      dueDate: '2024-01-20',
      submissions: 15,
      totalStudents: 25,
      status: 'active'
    },
    {
      id: 2,
      title: 'Examen Parcial',
      course: 'Cálculo Diferencial',
      type: 'Examen',
      dueDate: '2024-01-25',
      submissions: 8,
      totalStudents: 30,
      status: 'draft'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    title: '',
    course: '',
    type: 'Quiz',
    dueDate: ''
  });

  const handleAddEvaluation = (e) => {
    e.preventDefault();
    if (newEvaluation.title.trim()) {
      const evaluation = {
        id: Date.now(),
        ...newEvaluation,
        submissions: 0,
        totalStudents: 0,
        status: 'draft'
      };
      setEvaluations([...evaluations, evaluation]);
      setNewEvaluation({ title: '', course: '', type: 'Quiz', dueDate: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="evaluation-manager">
      <div className="evaluation-header">
        <h2>Gestión de Evaluaciones</h2>
        <button 
          className="add-evaluation-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Nueva Evaluación
        </button>
      </div>

      {showAddForm && (
        <div className="add-evaluation-form">
          <h3>Crear Nueva Evaluación</h3>
          <form onSubmit={handleAddEvaluation}>
            <div className="form-row">
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={newEvaluation.title}
                  onChange={(e) => setNewEvaluation({...newEvaluation, title: e.target.value})}
                  placeholder="Ej: Quiz Módulo 1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Curso</label>
                <select
                  value={newEvaluation.course}
                  onChange={(e) => setNewEvaluation({...newEvaluation, course: e.target.value})}
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {teacherData.courses.map(course => (
                    <option key={course.id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={newEvaluation.type}
                  onChange={(e) => setNewEvaluation({...newEvaluation, type: e.target.value})}
                >
                  <option value="Quiz">Quiz</option>
                  <option value="Examen">Examen</option>
                  <option value="Tarea">Tarea</option>
                  <option value="Proyecto">Proyecto</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Entrega</label>
                <input
                  type="date"
                  value={newEvaluation.dueDate}
                  onChange={(e) => setNewEvaluation({...newEvaluation, dueDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Crear Evaluación</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="evaluations-grid">
        {evaluations.map(evaluation => (
          <div key={evaluation.id} className="evaluation-card">
            <div className="evaluation-header-card">
              <div>
                <h3>{evaluation.title}</h3>
                <p className="evaluation-course">{evaluation.course}</p>
              </div>
              <div className="evaluation-actions">
                <button className="action-btn">
                  <FiEye />
                </button>
                <button className="action-btn">
                  <FiEdit />
                </button>
                <button className="action-btn delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
            
            <div className="evaluation-details">
              <div className="detail-item">
                <span className="detail-label">Tipo:</span>
                <span className="detail-value">{evaluation.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha límite:</span>
                <span className="detail-value">{evaluation.dueDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Entregas:</span>
                <span className="detail-value">{evaluation.submissions}/{evaluation.totalStudents}</span>
              </div>
            </div>

            <div className="evaluation-status">
              <span className={`status-badge ${evaluation.status}`}>
                {evaluation.status === 'active' ? 'Activa' : 'Borrador'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvaluationManager; 