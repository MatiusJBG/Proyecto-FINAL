import React, { useState } from 'react';
import { FiFileText, FiClock } from 'react-icons/fi';
import './PendingEvaluations.css';
import ExamAttempt from './ExamAttempt';

export default function PendingEvaluations({ evaluations = [], onEvaluationComplete, estudianteId }) {
  const [evaluacionActual, setEvaluacionActual] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const iniciarEvaluacion = (evaluacion) => {
    setEvaluacionActual(evaluacion);
    setMostrarFormulario(true);
  };

  const finalizarIntento = () => {
    setMostrarFormulario(false);
    setEvaluacionActual(null);
    if (onEvaluationComplete) onEvaluationComplete();
  };

  if (mostrarFormulario && evaluacionActual) {
    return (
      <ExamAttempt
        evaluacionId={evaluacionActual.id}
        estudianteId={estudianteId}
        onFinish={finalizarIntento}
      />
    );
  }

  return (
    <div className="pending-evaluations">
      <div className="panel-header">
        <h3>Evaluaciones Pendientes</h3>
        <span className="evaluation-count">{evaluations.length}</span>
      </div>
      
      <div className="evaluations-list">
        {evaluations.length === 0 ? (
          <div className="no-evaluations">
            <p>No tienes evaluaciones pendientes</p>
          </div>
        ) : (
          evaluations.map((evaluation) => (
            <div key={evaluation.id} className="evaluation-item">
              <div className="evaluation-info">
                <div className="evaluation-icon">
                  <FiFileText />
                </div>
                <div className="evaluation-details">
                  <h4>{evaluation.name}</h4>
                  {evaluation.contexto && (
                    <p className="evaluation-context">{evaluation.contexto}</p>
                  )}
                  <span className="evaluation-status pending">
                    <FiClock /> Pendiente
                  </span>
                </div>
              </div>
              
              <div className="evaluation-actions">
                <button 
                  className="btn-start-evaluation"
                  onClick={() => iniciarEvaluacion(evaluation)}
                >
                  Comenzar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 