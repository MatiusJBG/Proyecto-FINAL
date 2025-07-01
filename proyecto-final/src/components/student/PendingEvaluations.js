import React from 'react';
import { FiEdit, FiEye } from 'react-icons/fi';
import './PendingEvaluations.css';

export default function PendingEvaluations({ evaluations }) {
  return (
    <div className="pending-evaluations">
      <h3>Evaluaciones pendientes</h3>
      <ul>
        {evaluations.map(ev => (
          <li key={ev.id} className="evaluation-item">
            <span>{ev.name}</span>
            <div className="evaluation-actions">
              {ev.status === 'pending' && (
                <button className="eval-btn present-btn">
                  <FiEdit /> Presentar
                </button>
              )}
              {ev.status === 'feedback' && (
                <button className="eval-btn feedback-btn">
                  <FiEye /> Ver retroalimentación
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 