
import React, { useEffect, useState } from 'react';
import teacherApiService from '../../services/teacherApi';
import CourseDetail from './CourseDetail';
import './TeacherCourses.css';

function TeacherCourses({ teacherId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await teacherApiService.getTeacherCourses(teacherId);
        setCourses(data);
      } catch (err) {
        setError('No se pudieron cargar los cursos.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [teacherId]);

  if (loading) return <div>Cargando cursos...</div>;
  if (error) return <div>{error}</div>;

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} teacherId={teacherId} />;
  }

  return (
    <section className="teacher-courses">
      <h3>Mis Cursos</h3>
      <ul>
        {courses.map(course => (
          <li key={course.ID_Curso}>
            <button className="course-link" onClick={() => setSelectedCourse(course)}>{course.Nombre}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TeacherCourses;
