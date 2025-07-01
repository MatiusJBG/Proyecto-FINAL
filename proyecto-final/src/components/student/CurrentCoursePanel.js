import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import './CurrentCoursePanel.css';

export default function CurrentCoursePanel({ course }) {
  return (
    <div className="panel panel-current-course">
      <h2>Mi curso actual</h2>
      <p className="course-name">{course.name}</p>
      <p>Módulo: <b>{course.currentModule}</b></p>
      <p>Lección: <b>{course.currentLesson}</b></p>
      <button className="continue-btn">
        <FiChevronRight /> Continuar donde me quedé
      </button>
    </div>
  );
} 