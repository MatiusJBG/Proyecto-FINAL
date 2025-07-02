import React, { useState, useEffect } from 'react';
import './MaterialManager.css';

const MaterialManager = () => {
    const [materiales, setMateriales] = useState([]);
    const [lecciones, setLecciones] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedModulo, setSelectedModulo] = useState('');
    const [selectedLeccion, setSelectedLeccion] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'documento',
        url: '',
        orden: 0,
        duracion: null
    });
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Cargar cursos al iniciar
    useEffect(() => {
        cargarCursos();
    }, []);

    // Cargar módulos cuando se selecciona un curso
    useEffect(() => {
        if (selectedCurso) {
            cargarModulos(selectedCurso);
        }
    }, [selectedCurso]);

    // Cargar lecciones cuando se selecciona un módulo
    useEffect(() => {
        if (selectedModulo) {
            cargarLecciones(selectedModulo);
        }
    }, [selectedModulo]);

    // Cargar materiales cuando se selecciona una lección
    useEffect(() => {
        if (selectedLeccion) {
            cargarMateriales(selectedLeccion);
        }
    }, [selectedLeccion]);

    const cargarCursos = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cursos');
            const data = await response.json();
            setCursos(data);
        } catch (error) {
            console.error('Error cargando cursos:', error);
            setMessage('Error cargando cursos');
        }
    };

    const cargarModulos = async (cursoId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cursos/${cursoId}/modulos`);
            const data = await response.json();
            setModulos(data);
            setSelectedModulo('');
            setSelectedLeccion('');
        } catch (error) {
            console.error('Error cargando módulos:', error);
            setMessage('Error cargando módulos');
        }
    };

    const cargarLecciones = async (moduloId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/modulos/${moduloId}/lecciones`);
            const data = await response.json();
            setLecciones(data);
            setSelectedLeccion('');
        } catch (error) {
            console.error('Error cargando lecciones:', error);
            setMessage('Error cargando lecciones');
        }
    };

    const cargarMateriales = async (leccionId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/lecciones/${leccionId}/materiales`);
            const data = await response.json();
            setMateriales(data);
        } catch (error) {
            console.error('Error cargando materiales:', error);
            setMessage('Error cargando materiales');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const limpiarFormulario = () => {
        setFormData({
            nombre: '',
            tipo: 'documento',
            url: '',
            orden: 0,
            duracion: null
        });
        setEditingMaterial(null);
    };

    const crearMaterial = async (e) => {
        e.preventDefault();
        if (!selectedLeccion) {
            setMessage('Debe seleccionar una lección');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/materiales/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    leccion_id: parseInt(selectedLeccion)
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Material creado exitosamente');
                limpiarFormulario();
                cargarMateriales(selectedLeccion);
            } else {
                setMessage(data.error || 'Error creando material');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const editarMaterial = (material) => {
        setEditingMaterial(material);
        setFormData({
            nombre: material.nombre,
            tipo: material.tipo,
            url: material.url,
            orden: material.orden,
            duracion: material.duracion
        });
    };

    const actualizarMaterial = async (e) => {
        e.preventDefault();
        if (!editingMaterial) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/materiales/${editingMaterial.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Material actualizado exitosamente');
                limpiarFormulario();
                cargarMateriales(selectedLeccion);
            } else {
                setMessage(data.error || 'Error actualizando material');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const eliminarMaterial = async (materialId) => {
        if (!window.confirm('¿Está seguro de eliminar este material?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/materiales/${materialId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Material eliminado exitosamente');
                cargarMateriales(selectedLeccion);
            } else {
                setMessage(data.error || 'Error eliminando material');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const getTipoIcon = (tipo) => {
        const iconos = {
            'video': '🎥',
            'documento': '📄',
            'enlace': '🔗',
            'presentacion': '📊',
            'imagen': '🖼️'
        };
        return iconos[tipo] || '📁';
  };

  return (
        <div className="material-manager">
            <h2>Gestión de Materiales</h2>
            
            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="selection-panel">
                <div className="select-group">
                    <label>Curso:</label>
                    <select 
                        value={selectedCurso} 
                        onChange={(e) => setSelectedCurso(e.target.value)}
                    >
                        <option value="">Seleccionar curso</option>
                        {cursos.map(curso => (
                            <option key={curso.ID_Curso} value={curso.ID_Curso}>
                                {curso.Nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="select-group">
                    <label>Módulo:</label>
                    <select 
                        value={selectedModulo} 
                        onChange={(e) => setSelectedModulo(e.target.value)}
                        disabled={!selectedCurso}
                    >
                        <option value="">Seleccionar módulo</option>
                        {modulos.map(modulo => (
                            <option key={modulo.ID_Modulo} value={modulo.ID_Modulo}>
                                {modulo.Nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="select-group">
                    <label>Lección:</label>
                    <select 
                        value={selectedLeccion} 
                        onChange={(e) => setSelectedLeccion(e.target.value)}
                        disabled={!selectedModulo}
                    >
                        <option value="">Seleccionar lección</option>
                        {lecciones.map(leccion => (
                            <option key={leccion.ID_Leccion} value={leccion.ID_Leccion}>
                                {leccion.Nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="content-panel">
                <div className="form-section">
                    <h3>{editingMaterial ? 'Editar Material' : 'Crear Nuevo Material'}</h3>
                    <form onSubmit={editingMaterial ? actualizarMaterial : crearMaterial}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre:</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo:</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleInputChange}
                                >
                                    <option value="documento">Documento</option>
                                    <option value="video">Video</option>
                                    <option value="enlace">Enlace</option>
                                    <option value="presentacion">Presentación</option>
                                    <option value="imagen">Imagen</option>
                                </select>
                            </div>
      </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>URL:</label>
                                <input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Orden:</label>
                                <input
                                    type="number"
                                    name="orden"
                                    value={formData.orden}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Duración (minutos):</label>
                                <input
                                    type="number"
                                    name="duracion"
                                    value={formData.duracion || ''}
                                    onChange={handleInputChange}
                                    min="0"
                                    placeholder="Solo para videos"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                disabled={loading || !selectedLeccion}
                                className="btn-primary"
                            >
                                {loading ? 'Procesando...' : (editingMaterial ? 'Actualizar' : 'Crear')}
                            </button>
                            {editingMaterial && (
                                <button 
                                    type="button" 
                                    onClick={limpiarFormulario}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="materials-section">
                    <h3>Materiales de la Lección</h3>
                    {selectedLeccion ? (
                        <div className="materials-list">
                            {materiales.length === 0 ? (
                                <p className="no-materials">No hay materiales en esta lección</p>
                            ) : (
                                materiales.map(material => (
                                    <div key={material.id} className="material-item">
                                        <div className="material-info">
                                            <span className="material-icon">
                                                {getTipoIcon(material.tipo)}
                                            </span>
                                            <div className="material-details">
                                                <h4>{material.nombre}</h4>
                                                <p>Tipo: {material.tipo}</p>
                                                <p>Orden: {material.orden}</p>
                                                {material.duracion && (
                                                    <p>Duración: {material.duracion} min</p>
                                                )}
                                                <a href={material.url} target="_blank" rel="noopener noreferrer">
                                                    Ver recurso
                                                </a>
                                            </div>
                                        </div>
                                        <div className="material-actions">
                                            <button 
                                                onClick={() => editarMaterial(material)}
                                                className="btn-edit"
                                            >
                                                Editar
                                            </button>
            <button
                                                onClick={() => eliminarMaterial(material.id)}
                                                className="btn-delete"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <p className="select-leccion">Seleccione una lección para ver sus materiales</p>
                    )}
                </div>
          </div>
    </div>
  );
};

export default MaterialManager;
