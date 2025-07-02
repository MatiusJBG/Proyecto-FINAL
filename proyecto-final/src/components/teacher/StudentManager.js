import React, { useState, useEffect } from 'react';
import { FiSearch, FiMail, FiEye, FiBook, FiTrendingUp, FiCalendar, FiClock, FiUsers } from 'react-icons/fi';
import './StudentManager.css';
import teacherApiService from '../../services/teacherApi';

function StudentManager({ teacherData, teacherStats }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(null);

  // Cargar cursos y estudiantes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar cursos del profesor
        const coursesData = await teacherApiService.getTeacherCourses(teacherData.id);
        const formattedCourses = coursesData.map(course => 
          teacherApiService.formatCourseData(course)
        );
        setCourses(formattedCourses);
        
        // Cargar estudiantes de todos los cursos
        const allStudents = [];
        for (const course of formattedCourses) {
          try {
            const studentsData = await teacherApiService.getCourseStudents(teacherData.id, course.id);
            const formattedStudents = studentsData.map(student => ({
              ...teacherApiService.formatStudentData(student),
              courseName: course.name,
              courseId: course.id
            }));
            allStudents.push(...formattedStudents);
          } catch (err) {
            console.warn(`Error cargando estudiantes del curso ${course.id}:`, err);
          }
        }
        
        setStudents(allStudents);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (teacherData?.id) {
      loadData();
    }
  }, [teacherData?.id]);

  // Filtrar estudiantes por búsqueda y curso seleccionado
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === 'all' || student.courseId.toString() === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setShowStudentDetail(true);
    setLoadingHistory(true);
    setErrorHistory(null);
    try {
      const history = await teacherApiService.getStudentInteractionHistory(teacherData.id, student.id);
      setStudentHistory(history);
    } catch (err) {
      setErrorHistory('No se pudo cargar el historial de interacción.');
      setStudentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseStudentDetail = () => {
    setShowStudentDetail(false);
    setSelectedStudent(null);
    setStudentHistory([]);
    setErrorHistory(null);
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="student-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurrió
  if (error) {
    return (
      <div className="student-manager">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-manager">
      <div className="student-header">
        <div className="header-left">
          <h2>Gestión de Estudiantes</h2>
          {teacherStats && (
            <div className="stats-summary">
              <span className="stat-item">
                <FiUsers /> {teacherStats.students.total} estudiantes total
              </span>
              <span className="stat-item">
                <FiBook /> {teacherStats.students.coursesWithStudents} cursos con estudiantes
              </span>
            </div>
          )}
        </div>
        <div className="header-controls">
          <select 
            className="course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">Todos los cursos</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar estudiantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Progreso</th>
              <th>Lecciones Completadas</th>
              <th>Evaluaciones</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>
                  <div className="student-info">
                    <div className="student-avatar">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="student-name">{student.name}</div>
                      <div className="student-email">{student.email}</div>
                      <div className="student-semester">Semestre {student.semester}</div>
                    </div>
                  </div>
                </td>
                <td>{student.courseName}</td>
                <td>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${typeof student.progress === 'number' ? student.progress : parseFloat(student.progress) || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{
                      typeof student.progress === 'number'
                        ? student.progress.toFixed(1)
                        : !isNaN(parseFloat(student.progress))
                          ? parseFloat(student.progress).toFixed(1)
                          : '0.0'
                    }%</span>
                  </div>
                </td>
                <td>
                  <div className="lessons-info">
                    <FiBook />
                    <span>{student.lessonsCompleted} lecciones</span>
                  </div>
                </td>
                <td>
                  <div className="evaluations-info">
                    <FiTrendingUp />
                    <span>{student.evaluationsTaken} realizadas</span>
                    {student.averageScore > 0 && (
                      <div className="average-score">
                        Promedio: {student.averageScore.toFixed(1)}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${student.status}`}>
                    {student.status === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn" title="Ver perfil" onClick={() => handleViewStudent(student)}>
                      <FiEye />
                    </button>
                    <button className="action-btn" title="Enviar mensaje">
                      <FiMail />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No se encontraron estudiantes</h3>
          <p>
            {searchTerm || selectedCourse !== 'all' 
              ? 'No hay estudiantes que coincidan con los filtros aplicados.'
              : 'Aún no hay estudiantes matriculados en tus cursos.'
            }
          </p>
        </div>
      )}

      {/* Modal de detalle de estudiante */}
      {showStudentDetail && selectedStudent && (
        <div className="modal-overlay" onClick={handleCloseStudentDetail}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Estudiante</h3>
              <button className="modal-close" onClick={handleCloseStudentDetail}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-detail-info">
                <h4>{selectedStudent.name}</h4>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Curso:</strong> {selectedStudent.courseName}</p>
                <p><strong>Semestre:</strong> {selectedStudent.semester}</p>
                <p><strong>Estado:</strong> <span className={`status-badge ${selectedStudent.status}`}>{selectedStudent.status}</span></p>
                <p><strong>Progreso:</strong> {selectedStudent.progress.toFixed(1)}%</p>
                <p><strong>Lecciones completadas:</strong> {selectedStudent.lessonsCompleted}</p>
                <p><strong>Evaluaciones realizadas:</strong> {selectedStudent.evaluationsTaken}</p>
                <p><strong>Promedio evaluaciones:</strong> {selectedStudent.averageScore.toFixed(1)}</p>
              </div>
              <div className="student-history-section">
                <h4><FiClock /> Historial de Interacción</h4>
                {loadingHistory ? (
                  <div className="loading-history">Cargando historial...</div>
                ) : errorHistory ? (
                  <div className="error-history">{errorHistory}</div>
                ) : studentHistory.length === 0 ? (
                  <div className="empty-history">No hay interacciones registradas.</div>
                ) : (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Acción</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentHistory.slice(0, 20).map((event, idx) => (
                        <tr key={idx}>
                          <td>{new Date(event.fecha).toLocaleString()}</td>
                          <td>{event.accion}</td>
                          <td>{event.detalle}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManager; 