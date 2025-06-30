import React from 'react';
import { FiBell, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './StudentDashboard.css';

const iconByType = {
  reminder: <FiBell />, task: <FiCheckCircle />, alert: <FiAlertCircle />
};

export default function NotificationPanel({ notifications }) {
  return (
    <div className="notification-panel">
      <h3>Notificaciones</h3>
      <ul>
        {notifications.map(n => (
          <li key={n.id} className="notification-item">
            <span className="notification-icon">{iconByType[n.type] || <FiBell />}</span>
            <span>{n.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 