import React, { useState, useEffect } from 'react';
import './DecisionTreeManager.css';

const DecisionTreeManager = () => {
    const [arbolDecision, setArbolDecision] = useState(null);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [recomendacion, setRecomendacion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        cargarArbolDecision();
        cargarEstudiantes();
    }, []);

    const cargarArbolDecision = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/arbol-decision');
            const data = await response.json();
            
            if (response.ok) {
                setArbolDecision(data);
            } else {
                setMessage(data.error || 'Error cargando árbol de decisión');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error de conexión');
        }
    };

    const cargarEstudiantes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/estudiantes');
            const data = await response.json();
            setEstudiantes(data);
        } catch (error) {
            console.error('Error cargando estudiantes:', error);
            setMessage('Error cargando estudiantes');
        }
    };

    const generarRecomendacion = async () => {
        if (!selectedEstudiante) {
            setMessage('Seleccione un estudiante');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`http://localhost:5000/api/estudiante/${selectedEstudiante}/recomendacion-avanzada`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                setRecomendacion(data);
            } else {
                setMessage(data.error || 'Error generando recomendación');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const renderNodo = (nodo, nivel = 0) => {
        if (!nodo) return null;

        const indent = nivel * 40;
        const isHoja = nodo.es_hoja;

        return (
            <div key={nodo.id} className="tree-node" style={{ marginLeft: indent }}>
                <div className={`node-content ${isHoja ? 'leaf' : 'decision'}`}>
                    <div className="node-header">
                        <span className="node-id">#{nodo.id}</span>
                        <span className={`node-type ${nodo.tipo}`}>{nodo.tipo}</span>
                        <span className={`node-priority ${nodo.prioridad}`}>{nodo.prioridad}</span>
                    </div>
                    
                    {!isHoja && nodo.condicion && (
                        <div className="node-condition">
                            <strong>Condición:</strong> {nodo.condicion}
                        </div>
                    )}
                    
                    {nodo.accion && (
                        <div className="node-action">
                            <strong>Acción:</strong> {nodo.accion}
                        </div>
                    )}
                    
                    {isHoja && (
                        <div className="node-leaf-indicator">
                            🍃 Nodo Hoja
                        </div>
                    )}
                </div>
                
                <div className="node-children">
                    {nodo.izquierda && (
                        <div className="child-branch">
                            <div className="branch-label">Sí</div>
                            {renderNodo(nodo.izquierda, nivel + 1)}
                        </div>
                    )}
                    {nodo.derecha && (
                        <div className="child-branch">
                            <div className="branch-label">No</div>
                            {renderNodo(nodo.derecha, nivel + 1)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getPrioridadColor = (prioridad) => {
        const colores = {
            'alta': '#ef4444',
            'media': '#f59e0b',
            'baja': '#10b981'
        };
        return colores[prioridad] || '#6b7280';
    };

    const getTipoColor = (tipo) => {
        const colores = {
            'evaluacion': '#3b82f6',
            'progreso': '#10b981',
            'tiempo': '#f59e0b',
            'refuerzo': '#ef4444',
            'revision': '#8b5cf6',
            'motivacion': '#06b6d4',
            'general': '#6b7280'
        };
        return colores[tipo] || '#6b7280';
    };

    return (
        <div className="decision-tree-manager">
            <h2>Árbol de Decisión - Sistema de Recomendaciones</h2>
            
            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'info'}`}>
                    {message}
                </div>
            )}

            <div className="content-grid">
                <div className="tree-section">
                    <h3>Estructura del Árbol de Decisión</h3>
                    <div className="tree-container">
                        {arbolDecision && arbolDecision.raiz ? (
                            <div className="tree-visualization">
                                {renderNodo(arbolDecision.raiz)}
                            </div>
                        ) : (
                            <div className="no-tree">
                                <p>No hay árbol de decisión disponible</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="testing-section">
                    <h3>Probar Recomendaciones</h3>
                    
                    <div className="test-panel">
                        <div className="form-group">
                            <label>Seleccionar Estudiante:</label>
                            <select 
                                value={selectedEstudiante} 
                                onChange={(e) => setSelectedEstudiante(e.target.value)}
                            >
                                <option value="">Seleccionar estudiante</option>
                                {estudiantes.map(estudiante => (
                                    <option key={estudiante.ID_Estudiante} value={estudiante.ID_Estudiante}>
                                        {estudiante.Nombre} - {estudiante.Correo_electronico}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            onClick={generarRecomendacion}
                            disabled={loading || !selectedEstudiante}
                            className="btn-generate"
                        >
                            {loading ? 'Generando...' : '🎯 Generar Recomendación'}
                        </button>
                    </div>

                    {recomendacion && (
                        <div className="recommendation-panel">
                            <h4>Recomendación Generada</h4>
                            
                            <div className="student-data">
                                <h5>Datos del Estudiante</h5>
                                <div className="data-grid">
                                    <div className="data-item">
                                        <span className="data-label">Promedio Progreso:</span>
                                        <span className="data-value">{recomendacion.datos_estudiante.promedio_progreso.toFixed(1)}%</span>
                                    </div>
                                    <div className="data-item">
                                        <span className="data-label">Lecciones Completadas:</span>
                                        <span className="data-value">{recomendacion.datos_estudiante.lecciones_completadas}</span>
                                    </div>
                                    <div className="data-item">
                                        <span className="data-label">Promedio Puntajes:</span>
                                        <span className="data-value">{recomendacion.datos_estudiante.promedio_puntajes.toFixed(1)}%</span>
                                    </div>
                                    <div className="data-item">
                                        <span className="data-label">Evaluaciones Aprobadas:</span>
                                        <span className="data-value">{recomendacion.datos_estudiante.evaluaciones_aprobadas}/{recomendacion.datos_estudiante.total_evaluaciones}</span>
                                    </div>
                                    <div className="data-item">
                                        <span className="data-label">Tiempo Promedio:</span>
                                        <span className="data-value">{recomendacion.datos_estudiante.tiempo_promedio.toFixed(1)} min</span>
                                    </div>
                                </div>
                            </div>

                            <div className="recommendation-result">
                                <h5>Recomendación</h5>
                                <div 
                                    className="recommendation-card"
                                    style={{ 
                                        borderColor: getPrioridadColor(recomendacion.recomendacion.prioridad),
                                        backgroundColor: `${getPrioridadColor(recomendacion.recomendacion.prioridad)}10`
                                    }}
                                >
                                    <div className="recommendation-header">
                                        <span 
                                            className="recommendation-type"
                                            style={{ backgroundColor: getTipoColor(recomendacion.recomendacion.tipo) }}
                                        >
                                            {recomendacion.recomendacion.tipo}
                                        </span>
                                        <span 
                                            className="recommendation-priority"
                                            style={{ backgroundColor: getPrioridadColor(recomendacion.recomendacion.prioridad) }}
                                        >
                                            {recomendacion.recomendacion.prioridad}
                                        </span>
                                    </div>
                                    <p className="recommendation-text">
                                        {recomendacion.recomendacion.recomendacion}
                                    </p>
                                    <div className="recommendation-meta">
                                        <span>Regla ID: {recomendacion.recomendacion.regla_id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="info-section">
                <h3>Información del Árbol de Decisión</h3>
                <div className="info-grid">
                    <div className="info-card">
                        <h4>🎯 Propósito</h4>
                        <p>El árbol de decisión analiza el rendimiento del estudiante y genera recomendaciones personalizadas basadas en múltiples criterios.</p>
                    </div>
                    <div className="info-card">
                        <h4>📊 Criterios Evaluados</h4>
                        <ul>
                            <li>Promedio de puntajes en evaluaciones</li>
                            <li>Progreso general en el curso</li>
                            <li>Tasa de aprobación de evaluaciones</li>
                            <li>Tiempo dedicado al estudio</li>
                            <li>Número de lecciones completadas</li>
                        </ul>
                    </div>
                    <div className="info-card">
                        <h4>🎨 Tipos de Recomendación</h4>
                        <div className="type-legend">
                            <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
                                <span>Evaluación</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                                <span>Progreso</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
                                <span>Tiempo</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                                <span>Refuerzo</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
                                <span>Revisión</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#06b6d4' }}></span>
                                <span>Motivación</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DecisionTreeManager;
