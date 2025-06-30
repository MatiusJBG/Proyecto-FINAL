import React, { useState } from 'react';
import CourseList from './CourseList';
import CourseTree from './CourseTree';
import Recommendation from './Recommendation';
import LessonViewer from './LessonViewer';
// ... estilos opcionales ...

// Datos simulados para ejemplo
const mockCourses = [
  { id: 1, name: 'Matemáticas 1' },
  { id: 2, name: 'Historia Universal' },
];

const mockCourseTree = {
  1: {
    name: 'Matemáticas 1',
    modules: [
      {
        id: 'm1',
        name: 'Álgebra',
        lessons: [
          { id: 'l1', name: 'Ecuaciones', hasEvaluation: true },
          { id: 'l2', name: 'Inecuaciones', hasEvaluation: false },
        ],
      },
      {
        id: 'm2',
        name: 'Geometría',
        lessons: [
          { id: 'l3', name: 'Ángulos', hasEvaluation: true },
        ],
      },
    ],
  },
  2: {
    name: 'Historia Universal',
    modules: [
      {
        id: 'm3',
        name: 'Edad Antigua',
        lessons: [
          { id: 'l4', name: 'Egipto', hasEvaluation: true },
        ],
      },
    ],
  },
};

const mockRecommendation = {
  1: { lessonId: 'l2', lessonName: 'Inecuaciones' },
  2: { lessonId: 'l4', lessonName: 'Egipto' },
};

export default function StudentDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0].id);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedLesson(null);
  };

  const handleLessonSelect = (lessonId) => {
    setSelectedLesson(lessonId);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Bienvenido, Estudiante</h2>
      <CourseList courses={mockCourses} selected={selectedCourse} onSelect={handleCourseSelect} />
      <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>Estructura del curso</h3>
          <CourseTree tree={mockCourseTree[selectedCourse]} onLessonSelect={handleLessonSelect} />
        </div>
        <div style={{ flex: 1 }}>
          <Recommendation recommendation={mockRecommendation[selectedCourse]} />
          {selectedLesson && (
            <LessonViewer lessonId={selectedLesson} />
          )}
        </div>
      </div>
    </div>
  );
} 