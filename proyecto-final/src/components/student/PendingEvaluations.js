import React, { useState, useEffect } from 'react';
import { FiFileText, FiClock } from 'react-icons/fi';
import './PendingEvaluations.css';
import ExamAttempt from './ExamAttempt';

export default function PendingEvaluations({ evaluations = [], onEvaluationComplete, estudianteId }) {
  const [evaluacionActual, setEvaluacionActual] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [intentosRestantes, setIntentosRestantes] = useState({}); // { [evalId]: { usados, max } }

  useEffect(() => {
    async function fetchIntentos() {
      const nuevos = {};
      for (const evalItem of evaluations) {
        const res = await fetch(`/api/evaluaciones/${evalItem.id}/intentos/${estudianteId}`);
        const data = await res.json();
        nuevos[evalItem.id] = data;
      }
      setIntentosRestantes(nuevos);
    }
    if (evaluations.length > 0 && estudianteId) fetchIntentos();
  }, [evaluations, estudianteId]);

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
          evaluations.map((evaluation) => {
            const intentos = intentosRestantes[evaluation.id] || { usados: 0, max: evaluation.max_intentos || 1 };
            const quedan = intentos.max - intentos.usados;
            return (
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
                    <div className="evaluation-attempts">
                      Intentos usados: {intentos.usados} / {intentos.max}
                      {quedan <= 0 && <span style={{color:'#ef4444',marginLeft:8}}>Has alcanzado el máximo de intentos</span>}
                    </div>
                  </div>
                </div>
                
                <div className="evaluation-actions">
                  <button 
                    className="btn-start-evaluation"
                    onClick={() => iniciarEvaluacion(evaluation)}
                    disabled={quedan <= 0}
                  >
                    Comenzar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 