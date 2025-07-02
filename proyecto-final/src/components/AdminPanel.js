import React, { useState } from 'react';
import './AdminPanel.css';
import ContentManager from './admin/ContentManager';
import MaterialManager from './admin/MaterialManager';
import SearchManager from './admin/SearchManager';
import EvaluationManager from './admin/EvaluationManager';
import DecisionTreeManager from './admin/DecisionTreeManager';
import SupportManager from './admin/SupportManager';
import AdminTabs from './admin/AdminTabs';
import CreateUser from './admin/CreateUser';
import CreateTeacher from './admin/CreateTeacher';
import UserManagement from './admin/UserManagement';
import GraphsPanel from './admin/GraphsPanel';
import StatsPanel from './admin/StatsPanel';

// Estructuras simuladas (sin base de datos)
const initialData = {
  cursos: [],
};

function AdminPanel() {
  const [data, setData] = useState(initialData);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [selectedLeccion, setSelectedLeccion] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [activeTab, setActiveTab] = useState('contenido');

  // CRUD Cursos
  const agregarCurso = (nombre) => {
    setData({ ...data, cursos: [...data.cursos, { id: Date.now(), nombre, modulos: [] }] });
  };
  const eliminarCurso = (id) => {
    setData({ ...data, cursos: data.cursos.filter(c => c.id !== id) });
  };

  // CRUD Módulos
  const agregarModulo = (cursoId, nombre) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId ? { ...c, modulos: [...c.modulos, { id: Date.now(), nombre, lecciones: [] }] } : c
      ),
    });
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
  const agregarLeccion = (cursoId, moduloId, nombre) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId
          ? {
              ...c,
              modulos: c.modulos.map(m =>
                m.id === moduloId ? { ...m, lecciones: [...m.lecciones, { id: Date.now(), nombre, materiales: [] }] } : m
              ),
            }
          : c
      ),
    });
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

  // CRUD Materiales
  const agregarMaterial = (cursoId, moduloId, leccionId, nombre) => {
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
                        l.id === leccionId ? { ...l, materiales: [...l.materiales, { id: Date.now(), nombre }] } : l
                      ),
                    }
                  : m
              ),
            }
          : c
      ),
    });
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
  };

  // Búsqueda simple
  const buscar = (texto) => {
    setBusqueda(texto);
  };

  // Simulación de árbol binario de decisiones para recomendaciones
  const generarRecomendaciones = () => {
    // Aquí se simula la lógica, en el futuro se puede conectar a un backend
    setRecomendaciones(['Recomendación 1', 'Recomendación 2']);
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="admin-title">Panel de Administración</h2>
          <button
            className="admin-btn"
            style={{ background: '#e94560', color: '#fff', padding: '8px 18px', fontWeight: 'bold' }}
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            }}
          >
            Cerrar sesión
          </button>
        </div>
        <AdminTabs active={activeTab} setActive={setActiveTab} />
        {activeTab === 'contenido' && (
          <ContentManager
            data={data}
            setData={setData}
            selectedCurso={selectedCurso}
            setSelectedCurso={setSelectedCurso}
            selectedModulo={selectedModulo}
            setSelectedModulo={setSelectedModulo}
            selectedLeccion={selectedLeccion}
            setSelectedLeccion={setSelectedLeccion}
          />
        )}
        {activeTab === 'materiales' && <MaterialManager />}
        {activeTab === 'busqueda' && <SearchManager />}
        {activeTab === 'arboldecision' && <DecisionTreeManager />}
        {activeTab === 'evaluaciones' && <EvaluationManager data={data} setData={setData} />}
        {activeTab === 'crearusuario' && <CreateUser />}
        {activeTab === 'creardocente' && <CreateTeacher />}
        {activeTab === 'recomendaciones' && <DecisionTreeManager recomendaciones={recomendaciones} setRecomendaciones={setRecomendaciones} />}
        {activeTab === 'gestionusuarios' && <UserManagement />}
        {activeTab === 'grafos' && <GraphsPanel />}
        {activeTab === 'estadisticas' && <StatsPanel />}
      </div>
    </div>
  );
}

export default AdminPanel;
