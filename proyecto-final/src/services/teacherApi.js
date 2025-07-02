// Servicio API para el profesor
const API_BASE_URL = 'http://localhost:5000/api';

class TeacherApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Función helper para hacer peticiones HTTP
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================================================
  // ENDPOINTS DE INFORMACIÓN DEL PROFESOR
  // ============================================================================

  // Obtener información del profesor
  async getTeacherInfo(teacherId) {
    return this.makeRequest(`/profesor/${teacherId}`);
  }

  // Obtener estadísticas del profesor
  async getTeacherStats(teacherId) {
    return this.makeRequest(`/profesor/${teacherId}/estadisticas`);
  }

  // ============================================================================
  // ENDPOINTS DE GESTIÓN DE CURSOS
  // ============================================================================

  // Obtener todos los cursos del profesor
  async getTeacherCourses(teacherId) {
    return this.makeRequest(`/profesor/${teacherId}/cursos`);
  }

  // Crear un nuevo curso
  async createCourse(teacherId, courseData) {
    return this.makeRequest(`/profesor/${teacherId}/cursos`, {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // Actualizar un curso existente
  async updateCourse(teacherId, courseId, courseData) {
    return this.makeRequest(`/profesor/${teacherId}/cursos/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  // Eliminar un curso
  async deleteCourse(courseId) {
    return this.makeRequest(`/cursos/${courseId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // ENDPOINTS DE GESTIÓN DE ESTUDIANTES
  // ============================================================================

  // Obtener estudiantes de un curso específico
  async getCourseStudents(teacherId, courseId) {
    return this.makeRequest(`/profesor/${teacherId}/cursos/${courseId}/estudiantes`);
  }

  // Obtener progreso detallado de un estudiante
  async getStudentProgress(teacherId, studentId) {
    return this.makeRequest(`/profesor/${teacherId}/estudiantes/${studentId}/progreso`);
  }

  // Obtener historial de interacción de un estudiante
  async getStudentInteractionHistory(teacherId, studentId) {
    return this.makeRequest(`/profesor/${teacherId}/estudiantes/${studentId}/historial`);
  }

  // ============================================================================
  // ENDPOINTS DE GESTIÓN DE EVALUACIONES
  // ============================================================================

  // Obtener evaluaciones de un curso
  async getCourseEvaluations(teacherId, courseId) {
    return this.makeRequest(`/profesor/${teacherId}/cursos/${courseId}/evaluaciones`);
  }

  // Crear una nueva evaluación
  async createEvaluation(teacherId, evaluationData) {
    return this.makeRequest(`/profesor/${teacherId}/evaluaciones`, {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    });
  }

  // Obtener resultados de una evaluación
  async getEvaluationResults(teacherId, evaluationId) {
    return this.makeRequest(`/profesor/${teacherId}/evaluaciones/${evaluationId}/resultados`);
  }

  // ============================================================================
  // ENDPOINTS ADICIONALES
  // ============================================================================

  // Obtener todos los cursos disponibles (para selección)
  async getAllCourses() {
    return this.makeRequest('/cursos');
  }

  // Obtener módulos de un curso
  async getCourseModules(courseId) {
    return this.makeRequest(`/cursos/${courseId}/modulos`);
  }

  // Obtener lecciones de un módulo
  async getModuleLessons(moduleId) {
    return this.makeRequest(`/modulos/${moduleId}/lecciones`);
  }

  // ============================================================================
  // FUNCIONES HELPER
  // ============================================================================

  // Formatear datos del curso para la interfaz
  formatCourseData(courseData) {
    return {
      id: courseData.ID_Curso,
      name: courseData.Nombre,
      description: courseData.Descripcion || '',
      duration: courseData.Duracion_estimada || 0,
      status: courseData.Estado || 'activo',
      totalModules: courseData.total_modulos || 0,
      totalLessons: courseData.total_lecciones || 0,
      totalStudents: courseData.total_estudiantes || 0,
      createdAt: courseData.Fecha_creacion,
      teacherName: courseData.Profesor_Nombre || '',
    };
  }

  // Formatear datos del estudiante para la interfaz
  formatStudentData(studentData) {
    return {
      id: studentData.ID_Estudiante,
      name: studentData.Nombre,
      email: studentData.Correo_electronico,
      semester: studentData.Semestre,
      courseId: studentData.ID_Matricula,
      status: studentData.Estado,
      progress: studentData.Progreso_total || 0,
      lessonsCompleted: studentData.lecciones_completadas || 0,
      evaluationsTaken: studentData.evaluaciones_realizadas || 0,
      averageScore: studentData.promedio_evaluaciones || 0,
      enrollmentDate: studentData.Fecha_matricula,
    };
  }

  // Formatear datos de evaluación para la interfaz
  formatEvaluationData(evaluationData) {
    return {
      id: evaluationData.ID_Evaluacion,
      name: evaluationData.Nombre,
      description: evaluationData.Descripcion || '',
      passingScore: evaluationData.Puntaje_aprobacion,
      maxAttempts: evaluationData.Max_intentos,
      lessonId: evaluationData.ID_Leccion,
      moduleId: evaluationData.ID_Modulo,
      totalAttempts: evaluationData.total_intentos || 0,
      averageScore: evaluationData.promedio_puntaje || 0,
      passedCount: evaluationData.aprobados || 0,
      failedCount: evaluationData.reprobados || 0,
    };
  }

  // Formatear estadísticas del profesor para la interfaz
  formatTeacherStats(statsData) {
    return {
      courses: {
        total: statsData.cursos?.total_cursos || 0,
        active: statsData.cursos?.cursos_activos || 0,
        inactive: statsData.cursos?.cursos_inactivos || 0,
      },
      students: {
        total: statsData.estudiantes?.total_estudiantes || 0,
        coursesWithStudents: statsData.estudiantes?.cursos_con_estudiantes || 0,
        averageProgress: statsData.estudiantes?.promedio_progreso || 0,
      },
      evaluations: {
        total: statsData.evaluaciones?.total_evaluaciones || 0,
        averageScore: statsData.evaluaciones?.promedio_puntaje_general || 0,
        totalAttempts: statsData.evaluaciones?.total_intentos || 0,
      },
    };
  }
}

// Crear una instancia singleton del servicio
const teacherApiService = new TeacherApiService();

export default teacherApiService; 