import React from 'react';

import { useState } from 'react';


import Modal from './Modal';

function DecisionTreeManager({ recomendaciones, setRecomendaciones }) {
  const [reglas, setReglas] = useState([
    { id: 1, criterio: 'Puntaje < 60', recomendacion: 'Repetir lección' },
    { id: 2, criterio: 'Puntaje >= 60', recomendacion: 'Avanzar a siguiente módulo' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ criterio: '', recomendacion: '' });

  const agregarRegla = () => {
    setShowForm(true);
    setForm({ criterio: '', recomendacion: '' });
  };
  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.criterio.trim() || !form.recomendacion.trim()) return;
    setReglas([...reglas, { id: Date.now(), criterio: form.criterio, recomendacion: form.recomendacion }]);
    setShowForm(false);
  };
  const eliminarRegla = (id) => {
    setReglas(reglas.filter(r => r.id !== id));
  };
  const generarRecomendaciones = () => {
    setRecomendaciones(reglas.map(r => r.recomendacion));
  };

  return (
    <div className="admin-section">
      <h3>Árbol de Decisiones y Reglas</h3>
      <div style={{ marginBottom: 16, textAlign: 'left' }}>
        <button className="admin-btn" onClick={agregarRegla}>+ Agregar Regla</button>
      </div>
      <div style={{ width: '100%', overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23272f', borderRadius: 10, boxShadow: '0 2px 12px #0002' }}>
          <thead>
            <tr style={{ background: '#1a1d23', color: '#e94560' }}>
              <th style={{ padding: '12px 8px', minWidth: 180 }}>Criterio</th>
              <th style={{ padding: '12px 8px', minWidth: 220 }}>Recomendación</th>
              <th style={{ padding: '12px 8px', minWidth: 120, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reglas.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#bfc9d1', padding: 24 }}>No hay reglas registradas.</td></tr>
            )}
            {reglas.map(regla => (
              <tr key={regla.id} style={{ background: '#262a33', borderBottom: '1px solid #353b48' }}>
                <td style={{ color: '#fff' }}>{regla.criterio}</td>
                <td style={{ color: '#f1f1f1' }}>{regla.recomendacion}</td>
                <td style={{ textAlign: 'center' }}>
                  <button className="admin-btn" onClick={() => eliminarRegla(regla.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="admin-btn" onClick={generarRecomendaciones}>Generar Recomendaciones</button>
      <ul className="recommendation-list">
        {recomendaciones.map((rec, idx) => <li key={idx}>{rec}</li>)}
      </ul>
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 300 }}>
          <label>Criterio:
            <input type="text" value={form.criterio} onChange={e => setForm({ ...form, criterio: e.target.value })} className="admin-input" />
          </label>
          <label>Recomendación:
            <input type="text" value={form.recomendacion} onChange={e => setForm({ ...form, recomendacion: e.target.value })} className="admin-input" />
          </label>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button className="admin-btn" type="submit" style={{ minWidth: 100 }}>Agregar</button>
            <button className="admin-btn" type="button" style={{ background: '#353b48', color: '#fff', minWidth: 100 }} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DecisionTreeManager;
