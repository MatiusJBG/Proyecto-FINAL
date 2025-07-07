import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import DoorIcon from './DoorIcon';
import ContentManager from './admin/ContentManager';
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

  // Cargar cursos desde el backend al iniciar
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/estructura-completa', {
          credentials: 'include'
        });
        const data = await res.json();
        if (data && Array.isArray(data.cursos)) {
          // Mapea los campos de la base de datos a los que espera el frontend
          const cursosConModulos = data.cursos.map(c => ({
            id: c.ID_Curso || c.id,
            nombre: c.Nombre || c.nombre,
            descripcion: c.Descripcion || c.descripcion || '',
            activo: (c.Estado || c.estado || '').toLowerCase() === 'activo',
            docente: c.Profesor_Nombre || c.docente || '',
            duracion: c.Duracion_estimada || c.duracion_estimada,
            idProfesor: c.ID_Profesor || c.id_profesor,
            modulos: Array.isArray(c.modulos) ? c.modulos.map(m => ({
              id: m.ID_Modulo || m.id,
              nombre: m.Nombre || m.nombre,
              descripcion: m.Descripcion || m.descripcion || '',
              orden: m.Orden || m.orden || 1,
              duracion_estimada: m.Duracion_estimada || m.duracion_estimada || 0,
              lecciones: Array.isArray(m.lecciones) ? m.lecciones.map(l => ({
                id: l.ID_Leccion || l.id,
                nombre: l.Nombre || l.nombre,
                descripcion: l.Descripcion || l.descripcion || '',
                contenido: l.Contenido || l.contenido || '',
                orden: l.Orden || l.orden || 1,
                duracion_estimada: l.Duracion_estimada || l.duracion_estimada || 0,
                es_obligatoria: l.Es_obligatoria || l.es_obligatoria || true,
                evaluaciones: Array.isArray(l.evaluaciones) ? l.evaluaciones.map(e => ({
                  id: e.ID_Evaluacion || e.id,
                  nombre: e.Nombre || e.nombre || e.titulo || '',
                  descripcion: e.Descripcion || e.descripcion || '',
                  puntaje_aprobacion: e.Puntaje_aprobacion || e.puntaje_aprobacion || 70,
                  max_intentos: e.Max_intentos || e.max_intentos || 3
                })) : []
              })) : []
            })) : []
          }));
          setData(d => ({ ...d, cursos: cursosConModulos }));
        }
      } catch (e) {
        console.error('Error cargando estructura completa:', e);
        // Fallback: intentar cargar solo cursos básicos
        try {
          const res = await fetch('http://localhost:5000/api/cursos');
          const cursos = await res.json();
          if (Array.isArray(cursos)) {
            const cursosConModulos = cursos.map(c => ({
              id: c.ID_Curso || c.id,
              nombre: c.Nombre || c.nombre,
              descripcion: c.Descripcion || c.descripcion || '',
              activo: (c.Estado || c.estado || '').toLowerCase() === 'activo',
              docente: c.Profesor_Nombre || c.docente || '',
              duracion: c.Duracion_estimada || c.duracion_estimada,
              idProfesor: c.ID_Profesor || c.id_profesor,
              modulos: [],
            }));
            setData(d => ({ ...d, cursos: cursosConModulos }));
          }
        } catch (fallbackError) {
          console.error('Error en fallback:', fallbackError);
        }
      }
    };
    fetchCursos();
  }, []);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [selectedLeccion, setSelectedLeccion] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [activeTab, setActiveTab] = useState('contenido');

  // CRUD Cursos
  // Recargar cursos desde el backend después de agregar uno nuevo
  const recargarCursos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/estructura-completa', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data && Array.isArray(data.cursos)) {
        const cursosConModulos = data.cursos.map(c => ({
          id: c.ID_Curso || c.id,
          nombre: c.Nombre || c.nombre,
          descripcion: c.Descripcion || c.descripcion || '',
          estado: c.Estado || c.estado,
          duracion: c.Duracion_estimada || c.duracion_estimada,
          idProfesor: c.ID_Profesor || c.id_profesor,
          modulos: Array.isArray(c.modulos) ? c.modulos.map(m => ({
            id: m.ID_Modulo || m.id,
            nombre: m.Nombre || m.nombre,
            descripcion: m.Descripcion || m.descripcion || '',
            orden: m.Orden || m.orden || 1,
            duracion_estimada: m.Duracion_estimada || m.duracion_estimada || 0,
            lecciones: Array.isArray(m.lecciones) ? m.lecciones.map(l => ({
              id: l.ID_Leccion || l.id,
              nombre: l.Nombre || l.nombre,
              descripcion: l.Descripcion || l.descripcion || '',
              contenido: l.Contenido || l.contenido || '',
              orden: l.Orden || l.orden || 1,
              duracion_estimada: l.Duracion_estimada || l.duracion_estimada || 0,
              es_obligatoria: l.Es_obligatoria || l.es_obligatoria || true,
              evaluaciones: Array.isArray(l.evaluaciones) ? l.evaluaciones.map(e => ({
                id: e.ID_Evaluacion || e.id,
                nombre: e.Nombre || e.nombre || e.titulo || '',
                descripcion: e.Descripcion || e.descripcion || '',
                puntaje_aprobacion: e.Puntaje_aprobacion || e.puntaje_aprobacion || 70,
                max_intentos: e.Max_intentos || e.max_intentos || 3
              })) : []
            })) : []
          })) : []
        }));
        setData(d => ({ ...d, cursos: cursosConModulos }));
      }
    } catch (e) {
      console.error('Error recargando estructura completa:', e);
      // Fallback: intentar cargar solo cursos básicos
      try {
        const res = await fetch('http://localhost:5000/api/cursos');
        const cursos = await res.json();
        if (Array.isArray(cursos)) {
          const cursosConModulos = cursos.map(c => ({
            id: c.ID_Curso || c.id,
            nombre: c.Nombre || c.nombre,
            descripcion: c.Descripcion || c.descripcion || '',
            estado: c.Estado || c.estado,
            duracion: c.Duracion_estimada || c.duracion_estimada,
            idProfesor: c.ID_Profesor || c.id_profesor,
            modulos: [],
          }));
          setData(d => ({ ...d, cursos: cursosConModulos }));
        }
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
    }
  };

  // Esta función se pasa a CourseForm para que recargue los cursos reales
  const agregarCurso = () => {
    recargarCursos();
    // Actualizar timestamp para forzar recarga del grafo
    setData(d => ({ ...d, lastUpdate: Date.now() }));
  };
  const eliminarCurso = async (id) => {
    // Buscar el curso real para obtener el ID_Curso de la base de datos
    const curso = data.cursos.find(c => c.id === id || c.ID_Curso === id);
    const realId = curso?.ID_Curso || curso?.id || id;
    try {
      await fetch(`http://localhost:5000/api/cursos/${realId}`, { method: 'DELETE' });
      recargarCursos();
      // Actualizar timestamp para forzar recarga del grafo
      setData(d => ({ ...d, lastUpdate: Date.now() }));
    } catch (e) {
      // Puedes mostrar un error si lo deseas
    }
  };

  // CRUD Módulos
  const agregarModulo = (cursoId, nombre) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId ? { ...c, modulos: [...c.modulos, { id: Date.now(), nombre, lecciones: [] }] } : c
      ),
      lastUpdate: Date.now()
    });
  };
  const eliminarModulo = (cursoId, moduloId) => {
    setData({
      ...data,
      cursos: data.cursos.map(c =>
        c.id === cursoId ? { ...c, modulos: c.modulos.filter(m => m.id !== moduloId) } : c
      ),
      lastUpdate: Date.now()
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
      lastUpdate: Date.now()
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
      lastUpdate: Date.now()
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
          <span
            title="Cerrar sesión"
            style={{ cursor: 'pointer', marginLeft: 16 }}
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            }}
          >
            <DoorIcon style={{ fontSize: 28, color: '#333', verticalAlign: 'middle' }} />
          </span>
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
        {activeTab === 'arboldecision' && <DecisionTreeManager recomendaciones={recomendaciones} setRecomendaciones={setRecomendaciones} />}
        {activeTab === 'evaluaciones' && <EvaluationManager data={data} setData={setData} />}
        {activeTab === 'crearusuario' && <CreateUser />}
        {activeTab === 'creardocente' && <CreateTeacher />}
        {activeTab === 'gestionusuarios' && <UserManagement />}
        {activeTab === 'grafos' && <GraphsPanel data={data} key={data.lastUpdate || Date.now()} />}
        {activeTab === 'estadisticas' && <StatsPanel />}
      </div>
    </div>
  );
}

export default AdminPanel;
