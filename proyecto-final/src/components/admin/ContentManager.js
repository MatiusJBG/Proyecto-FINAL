import React, { useState, useEffect } from 'react';
import CourseForm from './CourseForm';
import Modal from './Modal';
import LessonForm from './LessonForm';

function ContentManager({ data, setData, selectedCurso, setSelectedCurso, selectedModulo, setSelectedModulo, selectedLeccion, setSelectedLeccion }) {
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [pendingCursoId, setPendingCursoId] = useState(null);
  const [pendingModuloId, setPendingModuloId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ type: null, ids: null });
  const [cursosConProfesores, setCursosConProfesores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar cursos con información de profesores
  const cargarCursosConProfesores = async () => {
    setLoading(true);
    try {
      // Obtener todos los cursos (ya incluye información del profesor)
      const responseCursos = await fetch('http://localhost:5000/api/cursos');
      if (responseCursos.ok) {
        const cursos = await responseCursos.json();
        
        // Para cada curso, obtener información adicional del profesor si es necesario
        const cursosConDetalles = await Promise.all(
          cursos.map(async (curso) => {
            try {
              // Si ya tenemos el nombre del profesor, solo necesitamos obtener más detalles
              if (curso.ID_Profesor && curso.Profesor_Nombre) {
                // Obtener información completa del profesor
                const responseProfesor = await fetch(`http://localhost:5000/api/profesor/${curso.ID_Profesor}`);
                let profesor = null;
                if (responseProfesor.ok) {
                  profesor = await responseProfesor.json();
                }
                
                return {
                  ...curso,
                  profesor: profesor || {
                    ID_Profesor: curso.ID_Profesor,
                    Nombre: curso.Profesor_Nombre,
                    Correo_electronico: 'No disponible'
                  }
                };
              } else {
                // Si no hay profesor asignado
                return {
                  ...curso,
                  profesor: null
                };
              }
            } catch (error) {
              console.error(`Error obteniendo profesor para curso ${curso.ID_Curso}:`, error);
              return {
                ...curso,
                profesor: curso.Profesor_Nombre ? {
                  ID_Profesor: curso.ID_Profesor,
                  Nombre: curso.Profesor_Nombre,
                  Correo_electronico: 'No disponible'
                } : null
              };
            }
          })
        );
        
        setCursosConProfesores(cursosConDetalles);
        console.log('Cursos cargados:', cursosConDetalles);
      }
    } catch (error) {
      console.error('Error cargando cursos con profesores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursosConProfesores();
  }, []);

  // CRUD Cursos
  // Ya no agregamos el curso localmente, solo cerramos el modal y dejamos que el padre recargue
  const agregarCurso = () => {
    setShowCourseForm(false);
    // Recargar datos después de agregar un curso
    setTimeout(() => {
      cargarCursosConProfesores();
    }, 1000);
  };
  
  const eliminarCurso = (id) => {
    setData({ ...data, cursos: data.cursos.filter(c => c.id !== id) });
  };

  // CRUD Módulos
  const agregarModulo = (cursoId, modulo) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId ? { ...c, modulos: [...c.modulos, { id: Date.now(), nombre: modulo.nombre, lecciones: [] }] } : c
      ),
    });
    setShowModuleForm(false);
    setPendingCursoId(null);
  };
  const eliminarModulo = (cursoId, moduloId) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId ? { ...c, modulos: c.modulos.filter(m => m.id !== moduloId) } : c
      ),
    });
  };

  // CRUD Lecciones
  const agregarLeccion = (cursoId, moduloId, leccion) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId
          ? {
              ...c,
              modulos: c.modulos.map(m =>
                m.id === moduloId ? { ...m, lecciones: [...m.lecciones, { id: Date.now(), nombre: leccion.nombre, evaluaciones: [], materiales: [] }] } : m
              ),
            }
          : c
      ),
    });
    setShowLessonForm(false);
    setPendingCursoId(null);
    setPendingModuloId(null);
  };
  const eliminarLeccion = (cursoId, moduloId, leccionId) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId
          ? {
              ...c,
              modulos: c.modulos.map(m =>
                m.id === moduloId ? { ...m, lecciones: m.lecciones.filter(l => l.id !== leccionId) } : m
              ),
            }
          : c
      ),
    });
  };

  // CRUD Evaluaciones
  const agregarEvaluacion = (cursoId, moduloId, leccionId) => {
    const nombre = prompt('Nombre de la evaluación:');
    if (nombre) {
      setData({
        ...data,
        cursos: data.cursos.map(c =>
          c.id === cursoId
            ? {
                ...c,
                modulos: c.modulos.map(m =>
                  m.id === moduloId
                    ? {
                        ...m,
                        lecciones: m.lecciones.map(l =>
                          l.id === leccionId
                            ? { ...l, evaluaciones: [...(l.evaluaciones || []), { id: Date.now(), nombre }] }
                            : l
                        ),
                      }
                    : m
                ),
              }
            : c
        ),
      });
    }
  };
  const eliminarEvaluacion = (cursoId, moduloId, leccionId, evaluacionId) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId
          ? {
              ...c,
              modulos: c.modulos.map(m =>
                m.id === moduloId
                  ? {
                      ...m,
                      lecciones: m.lecciones.map(l =>
                        l.id === leccionId
                          ? { ...l, evaluaciones: (l.evaluaciones || []).filter(ev => ev.id !== evaluacionId) }
                          : l
                      ),
                    }
                  : m
              ),
            }
          : c
      ),
    });
  };

  // Función para cambiar el estado del curso
  const cambiarEstadoCurso = async (cursoId, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cursos/${cursoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (response.ok) {
        // Recargar datos después de cambiar el estado
        cargarCursosConProfesores();
      }
    } catch (error) {
      console.error('Error cambiando estado del curso:', error);
    }
  };

  // Función para eliminar curso
  const eliminarCursoReal = async (cursoId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cursos/${cursoId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Recargar datos después de eliminar
        cargarCursosConProfesores();
      }
    } catch (error) {
      console.error('Error eliminando curso:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 200,
          background: 'linear-gradient(135deg, #23272f, #2b2f38)',
          borderRadius: 16,
          border: '2px solid #353b48'
        }}>
          <div style={{ textAlign: 'center', color: '#bfc9d1' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Cargando cursos...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3>Gestión de Contenido</h3>
        <button
          className="admin-btn"
          style={{ 
            fontWeight: 600, 
            fontSize: '1.05em', 
            padding: '10px 22px', 
            background: 'linear-gradient(135deg, #43d477, #2ecc71)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => setShowCourseForm(true)}
        >
          ➕ Agregar Curso
        </button>
      </div>

      {/* Modal para agregar curso */}
      <Modal open={showCourseForm} onClose={() => setShowCourseForm(false)}>
        <div style={{ minWidth: 340, maxWidth: 420 }}>
          <CourseForm onAdd={agregarCurso} onCancel={() => setShowCourseForm(false)} />
        </div>
      </Modal>

      <div style={{ width: '100%', overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          background: '#23272f', 
          borderRadius: 12, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: '2px solid #353b48'
        }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #1a1d23, #23272f)' }}>
              <th style={{ 
                padding: '16px 12px', 
                minWidth: 200, 
                textAlign: 'left',
                color: '#e94560',
                fontWeight: 700,
                fontSize: '14px'
              }}>
                📚 Curso
              </th>
              <th style={{ 
                padding: '16px 12px', 
                minWidth: 180, 
                textAlign: 'left',
                color: '#e94560',
                fontWeight: 700,
                fontSize: '14px'
              }}>
                👨‍🏫 Docente Asignado
              </th>
              <th style={{ 
                padding: '16px 12px', 
                minWidth: 120, 
                textAlign: 'center',
                color: '#e94560',
                fontWeight: 700,
                fontSize: '14px'
              }}>
                📊 Estado
              </th>
              <th style={{ 
                padding: '16px 12px', 
                minWidth: 140, 
                textAlign: 'center',
                color: '#e94560',
                fontWeight: 700,
                fontSize: '14px'
              }}>
                ⚙️ Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {cursosConProfesores.length === 0 && (
              <tr>
                <td colSpan={4} style={{ 
                  textAlign: 'center', 
                  color: '#bfc9d1', 
                  padding: 40,
                  fontSize: '16px'
                }}>
                  📚 No hay cursos registrados.
                </td>
              </tr>
            )}
            {cursosConProfesores.map(curso => (
              <tr key={curso.ID_Curso} style={{ 
                background: '#23272f', 
                borderBottom: '1px solid #353b48',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.parentElement.style.background = '#2b2f38';
              }}
              onMouseLeave={(e) => {
                e.target.parentElement.style.background = '#23272f';
              }}
              >
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px', marginBottom: 4 }}>
                    {curso.Nombre}
                  </div>
                  {curso.Descripcion && (
                    <div style={{ 
                      color: '#bfc9d1', 
                      fontSize: '14px', 
                      lineHeight: 1.4,
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {curso.Descripcion}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#888', 
                    marginTop: 4 
                  }}>
                    ID: {curso.ID_Curso} • Creado: {new Date(curso.Fecha_creacion).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  {curso.profesor ? (
                    <div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: '#43d477', 
                        fontSize: '14px',
                        marginBottom: 2
                      }}>
                        👨‍🏫 {curso.profesor.Nombre}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#bfc9d1' 
                      }}>
                        📧 {curso.profesor.Correo_electronico}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#888' 
                      }}>
                        ID: {curso.profesor.ID_Profesor}
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      color: '#fd9644', 
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      ⚠️ Sin docente asignado
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'center', padding: '16px 12px' }}>
                  <button 
                    className="admin-btn" 
                    style={{ 
                      background: curso.Estado === 'activo' ? 'linear-gradient(135deg, #43d477, #2ecc71)' : 'linear-gradient(135deg, #e94560, #c0392b)', 
                      color: '#fff', 
                      fontWeight: 700,
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: curso.Estado === 'activo' ? '0 4px 12px rgba(67, 212, 119, 0.3)' : '0 4px 12px rgba(233, 69, 96, 0.3)'
                    }} 
                    onClick={() => {
                      const nuevoEstado = curso.Estado === 'activo' ? 'inactivo' : 'activo';
                      cambiarEstadoCurso(curso.ID_Curso, nuevoEstado);
                    }}
                  >
                    {curso.Estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                  </button>
                </td>
                <td style={{ textAlign: 'center', padding: '16px 12px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      className="admin-btn" 
                      style={{ 
                        background: 'linear-gradient(135deg, #1e90ff, #3498db)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onClick={() => {
                        // Aquí podrías abrir un modal para editar el curso
                        console.log('Editar curso:', curso.ID_Curso);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="admin-btn" 
                      style={{ 
                        background: 'linear-gradient(135deg, #e94560, #c0392b)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onClick={() => setConfirmDelete({ 
                        type: 'curso', 
                        ids: { cursoId: curso.ID_Curso, cursoNombre: curso.Nombre } 
                      })}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar lección */}
      <Modal open={showLessonForm} onClose={() => { setShowLessonForm(false); setPendingCursoId(null); setPendingModuloId(null); }}>
        <LessonForm
          onAdd={leccion => agregarLeccion(pendingCursoId, pendingModuloId, leccion)}
          onCancel={() => { setShowLessonForm(false); setPendingCursoId(null); setPendingModuloId(null); }}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal open={!!confirmDelete.type} onClose={() => setConfirmDelete({ type: null, ids: null })}>
        <div style={{ 
          background: '#23272f', 
          padding: 24, 
          borderRadius: 12, 
          border: '2px solid #e94560',
          maxWidth: 400,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ color: '#e94560', marginBottom: 16 }}>Confirmar Eliminación</h3>
          <p style={{ color: '#bfc9d1', marginBottom: 24, lineHeight: 1.5 }}>
            ¿Estás seguro de que quieres eliminar el curso "{confirmDelete.ids?.cursoNombre}"?
            Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button 
              className="admin-btn"
              style={{ 
                background: '#353b48',
                color: '#bfc9d1',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setConfirmDelete({ type: null, ids: null })}
            >
              ❌ Cancelar
            </button>
            <button 
              className="admin-btn"
              style={{ 
                background: 'linear-gradient(135deg, #e94560, #c0392b)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
              onClick={() => {
                if (confirmDelete.type === 'curso') {
                  eliminarCursoReal(confirmDelete.ids.cursoId);
                }
                setConfirmDelete({ type: null, ids: null });
              }}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ContentManager;
