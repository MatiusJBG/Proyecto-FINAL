import React, { useEffect, useState } from 'react';
import teacherApiService from '../../services/teacherApi';
import './TeacherStudents.css';


function TeacherStudents({ teacherId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        // 1. Obtener todos los cursos del profesor
        const courses = await teacherApiService.getTeacherCourses(teacherId);
        let allStudents = [];
        // 2. Para cada curso, obtener los estudiantes
        for (const course of courses) {
          try {
            const studentsInCourse = await teacherApiService.getCourseStudents(teacherId, course.ID_Curso);
            // Si la respuesta es un array, concatena
            if (Array.isArray(studentsInCourse)) {
              allStudents = allStudents.concat(studentsInCourse.map(s => ({ ...s, courseName: course.Nombre })));
            }
          } catch (e) {
            // Si falla un curso, continúa con los demás
            continue;
          }
        }
        setStudents(allStudents);
      } catch (err) {
        setError('No se pudieron cargar los estudiantes.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllStudents();
  }, [teacherId]);

  if (loading) return <div>Cargando estudiantes...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="teacher-students">
      <h3>Estudiantes</h3>
      <ul>
        {students.length === 0 && <li>No hay estudiantes para mostrar.</li>}
        {students.map(student => (
          <li key={student.ID_Estudiante + '-' + student.courseName}>
            {student.Nombre} <span style={{color:'#888'}}>({student.courseName})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TeacherStudents;
