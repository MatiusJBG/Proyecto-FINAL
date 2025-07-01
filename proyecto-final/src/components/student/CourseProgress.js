import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import './CourseProgress.css';

export default function CourseProgress({ progress }) {
  return (
    <div className="course-progress">
      <div className="progress-header">
        <FiTrendingUp />
        <span>Progreso general</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <span className="progress-label">{progress}%</span>
      </div>
    </div>
  );
} 