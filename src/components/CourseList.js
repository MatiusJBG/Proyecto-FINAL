import React from 'react';

export default function CourseList({ courses, selected, onSelect }) {
  return (
    <div>
      <h3>Mis cursos</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {courses.map((course) => (
          <li key={course.id}>
            <button
              style={{
                background: course.id === selected ? '#1976d2' : '#eee',
                color: course.id === selected ? '#fff' : '#222',
                border: 'none',
                padding: '8px 16px',
                margin: '4px 0',
                borderRadius: 4,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
              onClick={() => onSelect(course.id)}
            >
              {course.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 