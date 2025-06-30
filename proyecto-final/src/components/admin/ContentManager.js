import React, { useState } from 'react';
import CourseForm from './CourseForm';
import Modal from './Modal';
import ModuleForm from './ModuleForm';
import LessonForm from './LessonForm';

function ContentManager({ data, setData, selectedCurso, setSelectedCurso, selectedModulo, setSelectedModulo, selectedLeccion, setSelectedLeccion }) {
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [pendingCursoId, setPendingCursoId] = useState(null);
  const [pendingModuloId, setPendingModuloId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ type: null, ids: null });
  // CRUD Cursos
  const agregarCurso = (curso) => {
    setData({
      ...data,
      cursos: [
        ...data.cursos,
        {
          id: Date.now(),
          nombre: curso.nombre,
          descripcion: curso.descripcion,
          modulos: []
        }
      ]
    });
    setShowCourseForm(false);
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

  return (
    <div className="admin-section">
      <h3>Gestión de Contenido</h3>

      <div style={{ marginBottom: 24, textAlign: 'left' }}>
        <button
          className="admin-btn"
          style={{ fontWeight: 600, fontSize: '1.05em', padding: '10px 22px', marginBottom: 8 }}
          onClick={() => setShowCourseForm(true)}
        >
          + Agregar Curso
        </button>
      </div>

      {/* Modal para agregar curso */}
      <Modal open={showCourseForm} onClose={() => setShowCourseForm(false)}>
        <div style={{ minWidth: 340, maxWidth: 420 }}>
          <CourseForm onAdd={agregarCurso} onCancel={() => setShowCourseForm(false)} />
        </div>
      </Modal>


      <div style={{ width: '100%', overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23272f', borderRadius: 10, boxShadow: '0 2px 12px #0002' }}>
          <thead>
            <tr style={{ background: '#1a1d23', color: '#e94560' }}>
              <th style={{ padding: '12px 8px', minWidth: 180, textAlign: 'left' }}>Curso</th>
              <th style={{ padding: '12px 8px', minWidth: 160, textAlign: 'left' }}>Módulo</th>
              <th style={{ padding: '12px 8px', minWidth: 160, textAlign: 'left' }}>Lección</th>
              <th style={{ padding: '12px 8px', minWidth: 120, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.cursos.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#bfc9d1', padding: 24 }}>No hay cursos registrados.</td></tr>
            )}
            {data.cursos.map(curso => (
              <React.Fragment key={curso.id}>
                <tr style={{ background: '#23272f', borderBottom: '1px solid #353b48' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: '#fff' }}>
                    {curso.nombre}
                    {curso.descripcion && <div style={{ color: '#bfc9d1', fontSize: '0.95em', marginTop: 2 }}>{curso.descripcion}</div>}
                  </td>
                  <td colSpan={2}></td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => { setShowModuleForm(true); setPendingCursoId(curso.id); }}>+ Módulo</button>
                    <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => setConfirmDelete({ type: 'curso', ids: { cursoId: curso.id } })}>Eliminar</button>
                  </td>
                </tr>
                {curso.modulos.length === 0 && (
                  <tr style={{ background: '#23272f' }}>
                    <td></td>
                    <td colSpan={2} style={{ color: '#bfc9d1', fontStyle: 'italic', padding: '8px 8px' }}>Sin módulos</td>
                    <td></td>
                  </tr>
                )}
                {curso.modulos.map(modulo => (
                  <React.Fragment key={modulo.id}>
                    <tr style={{ background: '#262a33' }}>
                      <td></td>
                      <td style={{ padding: '10px 8px', fontWeight: 500, color: '#f1f1f1' }}>{modulo.nombre}</td>
                      <td colSpan={1}></td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => { setShowLessonForm(true); setPendingCursoId(curso.id); setPendingModuloId(modulo.id); }}>+ Lección</button>
                        <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => setConfirmDelete({ type: 'modulo', ids: { cursoId: curso.id, moduloId: modulo.id } })}>Eliminar</button>
                      </td>
                    </tr>
                    {modulo.lecciones.length === 0 && (
                      <tr style={{ background: '#262a33' }}>
                        <td></td><td></td>
                        <td style={{ color: '#bfc9d1', fontStyle: 'italic', padding: '8px 8px' }}>Sin lecciones</td>
                        <td></td>
                      </tr>
                    )}
                    {modulo.lecciones.map(leccion => (
                      <tr key={leccion.id} style={{ background: '#2b2f38' }}>
                        <td></td><td></td>
                        <td style={{ padding: '10px 8px', color: '#f1f1f1' }}>{leccion.nombre}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => setConfirmDelete({ type: 'leccion', ids: { cursoId: curso.id, moduloId: modulo.id, leccionId: leccion.id } })}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar módulo */}
      <Modal open={showModuleForm} onClose={() => { setShowModuleForm(false); setPendingCursoId(null); }}>
        <ModuleForm
          onAdd={modulo => agregarModulo(pendingCursoId, modulo)}
          onCancel={() => { setShowModuleForm(false); setPendingCursoId(null); }}
        />
      </Modal>

      {/* Modal para agregar lección */}
      <Modal open={showLessonForm} onClose={() => { setShowLessonForm(false); setPendingCursoId(null); setPendingModuloId(null); }}>
        <LessonForm
          onAdd={leccion => agregarLeccion(pendingCursoId, pendingModuloId, leccion)}
          onCancel={() => { setShowLessonForm(false); setPendingCursoId(null); setPendingModuloId(null); }}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal open={!!confirmDelete.type} onClose={() => setConfirmDelete({ type: null, ids: null })}>
        <div style={{ textAlign: 'center' }}>
          <p>¿Estás seguro de que deseas eliminar este elemento?</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button
              className="admin-btn"
              onClick={() => {
                if (confirmDelete.type === 'curso') eliminarCurso(confirmDelete.ids.cursoId);
                if (confirmDelete.type === 'modulo') eliminarModulo(confirmDelete.ids.cursoId, confirmDelete.ids.moduloId);
                if (confirmDelete.type === 'leccion') eliminarLeccion(confirmDelete.ids.cursoId, confirmDelete.ids.moduloId, confirmDelete.ids.leccionId);
                setConfirmDelete({ type: null, ids: null });
              }}
            >Eliminar</button>
            <button className="admin-btn" onClick={() => setConfirmDelete({ type: null, ids: null })}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ContentManager;
