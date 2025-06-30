import React from 'react';

export default function CourseTree({ tree, onLessonSelect }) {
  if (!tree) return <div>No hay datos del curso.</div>;
  return (
    <div>
      {tree.modules.map((mod) => (
        <div key={mod.id} style={{ marginBottom: 12 }}>
          <strong>{mod.name}</strong>
          <ul style={{ marginLeft: 16 }}>
            {mod.lessons.map((lesson) => (
              <li key={lesson.id}>
                <span
                  style={{ cursor: 'pointer', color: '#1976d2' }}
                  onClick={() => onLessonSelect(lesson.id)}
                >
                  {lesson.name}
                </span>
                {lesson.hasEvaluation && <span style={{ marginLeft: 8, color: '#888' }}>(Evaluación)</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
} 