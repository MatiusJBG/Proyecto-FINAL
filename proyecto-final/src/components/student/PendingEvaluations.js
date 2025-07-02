import React, { useState } from 'react';
import { FiFileText, FiCheck, FiX, FiClock } from 'react-icons/fi';
import './PendingEvaluations.css';

export default function PendingEvaluations({ evaluations = [], onEvaluationComplete }) {
  const [evaluacionActual, setEvaluacionActual] = useState(null);
  const [puntaje, setPuntaje] = useState('');
  const [tiempoUtilizado, setTiempoUtilizado] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const iniciarEvaluacion = (evaluacion) => {
    setEvaluacionActual(evaluacion);
    setMostrarFormulario(true);
    setPuntaje('');
    setTiempoUtilizado('');
  };

  const completarEvaluacion = async () => {
    if (!puntaje || !tiempoUtilizado) {
      alert('Por favor completa todos los campos');
      return;
    }

    const puntajeNum = parseFloat(puntaje);
    const tiempoNum = parseInt(tiempoUtilizado);

    if (isNaN(puntajeNum) || puntajeNum < 0 || puntajeNum > 100) {
      alert('El puntaje debe estar entre 0 y 100');
      return;
    }

    if (isNaN(tiempoNum) || tiempoNum < 0) {
      alert('El tiempo debe ser un número positivo');
      return;
    }

    try {
      if (onEvaluationComplete) {
        await onEvaluationComplete(evaluacionActual.id, puntajeNum, tiempoNum);
      }
      
      setMostrarFormulario(false);
      setEvaluacionActual(null);
      setPuntaje('');
      setTiempoUtilizado('');
      
      alert('Evaluación completada exitosamente');
    } catch (error) {
      console.error('Error completando evaluación:', error);
      alert('Error al completar la evaluación');
    }
  };

  const cancelarEvaluacion = () => {
    setMostrarFormulario(false);
    setEvaluacionActual(null);
    setPuntaje('');
    setTiempoUtilizado('');
  };

  if (mostrarFormulario && evaluacionActual) {
    return (
      <div className="pending-evaluations">
        <div className="panel-header">
          <h3>Completar Evaluación</h3>
        </div>
        
        <div className="evaluation-form">
          <div className="evaluation-info">
            <h4>{evaluacionActual.name}</h4>
            {evaluacionActual.contexto && (
              <p className="evaluation-context">Contexto: {evaluacionActual.contexto}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="puntaje">Puntaje obtenido (0-100):</label>
            <input
              type="number"
              id="puntaje"
              min="0"
              max="100"
              step="0.01"
              value={puntaje}
              onChange={(e) => setPuntaje(e.target.value)}
              placeholder="Ej: 85.5"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tiempo">Tiempo utilizado (minutos):</label>
            <input
              type="number"
              id="tiempo"
              min="0"
              value={tiempoUtilizado}
              onChange={(e) => setTiempoUtilizado(e.target.value)}
              placeholder="Ej: 45"
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="btn-complete" 
              onClick={completarEvaluacion}
            >
              <FiCheck /> Completar Evaluación
            </button>
            <button 
              className="btn-cancel" 
              onClick={cancelarEvaluacion}
            >
              <FiX /> Cancelar
            </button>
          </div>
        </div>
      </div>
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