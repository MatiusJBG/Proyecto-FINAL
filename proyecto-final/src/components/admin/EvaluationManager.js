import React, { useState } from 'react';
import Modal from './Modal';

function EvaluationManager({ data, setData }) {
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [pending, setPending] = useState({ cursoId: null, moduloId: null, leccionId: null, evalId: null });
  const [form, setForm] = useState({ nombre: '' });
  const [error, setError] = useState('');

  const agregarEvaluacion = (cursoId, moduloId, leccionId, evaluacion) => {
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
                          ? { ...l, evaluaciones: [...(l.evaluaciones || []), { id: Date.now(), nombre: evaluacion.nombre }] }
                          : l
                      ),
                    }
                  : m
              ),
            }
          : c
      ),
    });
    setShowEvalForm(false);
    setPending({ cursoId: null, moduloId: null, leccionId: null, evalId: null });
    setForm({ nombre: '' });
    setError('');
  };

  const editarEvaluacion = (cursoId, moduloId, leccionId, evalId, evaluacion) => {
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
                          ? {
                              ...l,
                              evaluaciones: l.evaluaciones.map(ev =>
                                ev.id === evalId ? { ...ev, nombre: evaluacion.nombre } : ev
                              ),
                            }
                          : l
                      ),
                    }
                  : m
              ),
            }
          : c
      ),
    });
    setShowEditForm(false);
    setPending({ cursoId: null, moduloId: null, leccionId: null, evalId: null });
    setForm({ nombre: '' });
    setError('');
  };

  const eliminarEvaluacion = (cursoId, moduloId, leccionId, evalId) => {
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
                          ? { ...l, evaluaciones: l.evaluaciones.filter(ev => ev.id !== evalId) }
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
      <h3>Gestión de Evaluaciones</h3>
      <div style={{ width: '100%', overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23272f', borderRadius: 10, boxShadow: '0 2px 12px #0002' }}>
          <thead>
            <tr style={{ background: '#1a1d23', color: '#e94560' }}>
              <th style={{ padding: '12px 8px', minWidth: 180 }}>Curso</th>
              <th style={{ padding: '12px 8px', minWidth: 160 }}>Módulo</th>
              <th style={{ padding: '12px 8px', minWidth: 160 }}>Lección</th>
              <th style={{ padding: '12px 8px', minWidth: 160 }}>Evaluación</th>
              <th style={{ padding: '12px 8px', minWidth: 120, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.cursos.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#bfc9d1', padding: 24 }}>No hay cursos registrados.</td></tr>
            )}
            {data.cursos.map(curso => (
              <React.Fragment key={curso.id}>
                {curso.modulos.map(modulo => (
                  <React.Fragment key={modulo.id}>
                    {Array.isArray(modulo.lecciones) && modulo.lecciones.map(leccion => (
                      <React.Fragment key={leccion.id}>
                        {(leccion.evaluaciones && leccion.evaluaciones.length > 0) ? (
                          leccion.evaluaciones.map(ev => (
                            <tr key={ev.id} style={{ background: '#2b2f38', borderBottom: '1px solid #353b48' }}>
                              <td style={{ color: '#fff', fontWeight: 600 }}>{curso.nombre}</td>
                              <td style={{ color: '#f1f1f1' }}>{modulo.nombre}</td>
                              <td style={{ color: '#f1f1f1' }}>{leccion.nombre}</td>
                              <td style={{ color: '#f1f1f1' }}>{ev.nombre}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => {
                                  setShowEditForm(true);
                                  setPending({ cursoId: curso.id, moduloId: modulo.id, leccionId: leccion.id, evalId: ev.id });
                                  setForm({ nombre: ev.nombre });
                                }}>Editar</button>
                                <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => eliminarEvaluacion(curso.id, modulo.id, leccion.id, ev.id)}>Eliminar</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr style={{ background: '#262a33' }}>
                            <td style={{ color: '#fff', fontWeight: 600 }}>{curso.nombre}</td>
                            <td style={{ color: '#f1f1f1' }}>{modulo.nombre}</td>
                            <td style={{ color: '#f1f1f1' }}>{leccion.nombre}</td>
                            <td style={{ color: '#bfc9d1', fontStyle: 'italic' }}>Sin evaluaciones</td>
                            <td style={{ textAlign: 'center' }}></td>
                          </tr>
                        )}
                        <tr style={{ background: '#23272f' }}>
                          <td colSpan={5} style={{ textAlign: 'right', padding: '6px 12px' }}>
                            <button
                              className="admin-btn"
                              onClick={() => {
                                setShowEvalForm(true);
                                setPending({ cursoId: curso.id, moduloId: modulo.id, leccionId: leccion.id, evalId: null });
                                setForm({ nombre: '' });
                              }}
                            >+ Agregar Evaluación</button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                    {modulo.lecciones.length === 0 && (
                      <tr key={modulo.id + '-no-lecciones'} style={{ background: '#262a33' }}>
                        <td>{curso.nombre}</td>
                        <td>{modulo.nombre}</td>
                        <td colSpan={3} style={{ color: '#bfc9d1', fontStyle: 'italic', padding: '8px 8px' }}>Sin lecciones</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {curso.modulos.length === 0 && (
                  <tr style={{ background: '#23272f' }}>
                    <td>{curso.nombre}</td>
                    <td colSpan={4} style={{ color: '#bfc9d1', fontStyle: 'italic', padding: '8px 8px' }}>Sin módulos</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={showEvalForm} onClose={() => { setShowEvalForm(false); setPending({ cursoId: null, moduloId: null, leccionId: null, evalId: null }); setForm({ nombre: '' }); setError(''); }}>
        <form onSubmit={e => {
          e.preventDefault();
          if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
          agregarEvaluacion(pending.cursoId, pending.moduloId, pending.leccionId, form);
        }} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 300 }}>
          <label>Nombre de la evaluación:
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="admin-input" />
          </label>
          {error && <div style={{ color: '#e94560', marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button className="admin-btn" type="submit" style={{ minWidth: 100 }}>Agregar</button>
            <button className="admin-btn" type="button" style={{ background: '#353b48', color: '#fff', minWidth: 100 }} onClick={() => { setShowEvalForm(false); setError(''); }}>Cancelar</button>
          </div>
        </form>
      </Modal>
      <Modal open={showEditForm} onClose={() => { setShowEditForm(false); setPending({ cursoId: null, moduloId: null, leccionId: null, evalId: null }); setForm({ nombre: '' }); setError(''); }}>
        <form onSubmit={e => {
          e.preventDefault();
          if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
          editarEvaluacion(pending.cursoId, pending.moduloId, pending.leccionId, pending.evalId, form);
        }} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 300 }}>
          <label>Nombre de la evaluación:
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="admin-input" />
          </label>
          {error && <div style={{ color: '#e94560', marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button className="admin-btn" type="submit" style={{ minWidth: 100 }}>Guardar</button>
            <button className="admin-btn" type="button" style={{ background: '#353b48', color: '#fff', minWidth: 100 }} onClick={() => { setShowEditForm(false); setError(''); }}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EvaluationManager;
