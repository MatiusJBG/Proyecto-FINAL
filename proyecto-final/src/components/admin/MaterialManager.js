import React, { useState } from 'react';
import Modal from './Modal';
import MaterialForm from './MaterialForm';

function MaterialManager({ data, setData }) {
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [pending, setPending] = useState({ cursoId: null, moduloId: null, leccionId: null, materialId: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, cursoId: null, moduloId: null, leccionId: null, materialId: null });

  const agregarMaterial = (cursoId, moduloId, leccionId, material) => {
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
                          ? { ...l, materiales: [...(l.materiales || []), { id: Date.now(), nombre: material.nombre }] }
                          : l
                      ),
                    }
                  : m
              ),
            }
          : c
      ),
    });
    setShowMaterialForm(false);
    setPending({ cursoId: null, moduloId: null, leccionId: null, materialId: null });
  };

  const editarMaterial = (cursoId, moduloId, leccionId, materialId, nuevoMaterial) => {
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
                              materiales: l.materiales.map(mat =>
                                mat.id === materialId ? { ...mat, nombre: nuevoMaterial.nombre } : mat
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
    setPending({ cursoId: null, moduloId: null, leccionId: null, materialId: null });
  };

  const eliminarMaterial = (cursoId, moduloId, leccionId, materialId) => {
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
                          ? { ...l, materiales: l.materiales.filter(mat => mat.id !== materialId) }
                          : l
                      ),
                    }
                  : m
              ),
            }
          : c
      ),
    });
    setConfirmDelete({ open: false, cursoId: null, moduloId: null, leccionId: null, materialId: null });
  };

  return (
    <div className="admin-section">
      <h3>Gestión de Materiales</h3>

      <div style={{ width: '100%', overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23272f', borderRadius: 10, boxShadow: '0 2px 12px #0002' }}>
          <thead>
            <tr style={{ background: '#1a1d23', color: '#e94560' }}>
              <th style={{ padding: '12px 8px', minWidth: 180, textAlign: 'left' }}>Curso</th>
              <th style={{ padding: '12px 8px', minWidth: 160, textAlign: 'left' }}>Módulo</th>
              <th style={{ padding: '12px 8px', minWidth: 160, textAlign: 'left' }}>Lección</th>
              <th style={{ padding: '12px 8px', minWidth: 160, textAlign: 'left' }}>Material</th>
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
                        {(leccion.materiales && leccion.materiales.length > 0) ? (
                          leccion.materiales.map(mat => (
                            <tr key={mat.id} style={{ background: '#2b2f38', borderBottom: '1px solid #353b48' }}>
                              <td style={{ color: '#fff', fontWeight: 600 }}>{curso.nombre}</td>
                              <td style={{ color: '#f1f1f1' }}>{modulo.nombre}</td>
                              <td style={{ color: '#f1f1f1' }}>{leccion.nombre}</td>
                              <td style={{ color: '#f1f1f1' }}>{mat.nombre}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => {
                                  setShowEditForm(true);
                                  setPending({ cursoId: curso.id, moduloId: modulo.id, leccionId: leccion.id, materialId: mat.id, nombre: mat.nombre });
                                }}>Editar</button>
                                <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => setConfirmDelete({ open: true, cursoId: curso.id, moduloId: modulo.id, leccionId: leccion.id, materialId: mat.id })}>Eliminar</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr style={{ background: '#262a33' }}>
                            <td style={{ color: '#fff', fontWeight: 600 }}>{curso.nombre}</td>
                            <td style={{ color: '#f1f1f1' }}>{modulo.nombre}</td>
                            <td style={{ color: '#f1f1f1' }}>{leccion.nombre}</td>
                            <td style={{ color: '#bfc9d1', fontStyle: 'italic' }}>Sin materiales</td>
                            <td style={{ textAlign: 'center' }}></td>
                          </tr>
                        )}
                        <tr style={{ background: '#23272f' }}>
                          <td colSpan={5} style={{ textAlign: 'right', padding: '6px 12px' }}>
                            <button
                              className="admin-btn"
                              onClick={() => {
                                setShowMaterialForm(true);
                                setPending({ cursoId: curso.id, moduloId: modulo.id, leccionId: leccion.id, materialId: null });
                              }}
                            >+ Agregar Material</button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
                {/* Si no hay módulos o lecciones, mostrar mensaje */}
                {curso.modulos.length === 0 && (
                  <tr style={{ background: '#23272f' }}>
                    <td>{curso.nombre}</td>
                    <td colSpan={4} style={{ color: '#bfc9d1', fontStyle: 'italic', padding: '8px 8px' }}>Sin módulos</td>
                  </tr>
                )}
                {curso.modulos.map(modulo => (
                  modulo.lecciones.length === 0 ? (
                    <tr key={modulo.id + '-no-lecciones'} style={{ background: '#262a33' }}>
                      <td>{curso.nombre}</td>
                      <td>{modulo.nombre}</td>
                      <td colSpan={3} style={{ color: '#bfc9d1', fontStyle: 'italic', padding: '8px 8px' }}>Sin lecciones</td>
                    </tr>
                  ) : null
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar material */}
      <Modal open={showMaterialForm} onClose={() => { setShowMaterialForm(false); setPending({ cursoId: null, moduloId: null, leccionId: null, materialId: null }); }}>
        <MaterialForm
          onAdd={material => agregarMaterial(pending.cursoId, pending.moduloId, pending.leccionId, material)}
          onCancel={() => { setShowMaterialForm(false); setPending({ cursoId: null, moduloId: null, leccionId: null, materialId: null }); }}
        />
      </Modal>

      {/* Modal para editar material */}
      <Modal open={showEditForm} onClose={() => { setShowEditForm(false); setPending({ cursoId: null, moduloId: null, leccionId: null, materialId: null }); }}>
        <MaterialForm
          initialName={pending.nombre}
          onAdd={material => editarMaterial(pending.cursoId, pending.moduloId, pending.leccionId, pending.materialId, material)}
          onCancel={() => { setShowEditForm(false); setPending({ cursoId: null, moduloId: null, leccionId: null, materialId: null }); }}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, cursoId: null, moduloId: null, leccionId: null, materialId: null })}>
        <div style={{ textAlign: 'center' }}>
          <p>¿Estás seguro de que deseas eliminar este material?</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button
              className="admin-btn"
              onClick={() => eliminarMaterial(confirmDelete.cursoId, confirmDelete.moduloId, confirmDelete.leccionId, confirmDelete.materialId)}
            >Eliminar</button>
            <button className="admin-btn" onClick={() => setConfirmDelete({ open: false, cursoId: null, moduloId: null, leccionId: null, materialId: null })}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MaterialManager;
