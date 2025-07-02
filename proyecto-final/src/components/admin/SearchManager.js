import React, { useState } from 'react';
import './SearchManager.css';

const SearchManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedCurso, setSelectedCurso] = useState('');
    const [cursos, setCursos] = useState([]);
    const [estructuraCompleta, setEstructuraCompleta] = useState(null);

    // Cargar cursos al iniciar
    React.useEffect(() => {
        cargarCursos();
    }, []);

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

    const buscarContenido = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setMessage('Ingrese un término de búsqueda');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const url = selectedCurso 
                ? `http://localhost:5000/api/cursos/${selectedCurso}/buscar?termino=${encodeURIComponent(searchTerm)}`
                : `http://localhost:5000/api/buscar?termino=${encodeURIComponent(searchTerm)}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setSearchResults(data.resultados || []);
                if (data.resultados && data.resultados.length === 0) {
                    setMessage('No se encontraron resultados');
                }
            } else {
                setMessage(data.error || 'Error en la búsqueda');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const cargarEstructuraCompleta = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/estructura-completa');
            const data = await response.json();
            
            if (response.ok) {
                setEstructuraCompleta(data);
            } else {
                setMessage(data.error || 'Error cargando estructura');
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
            'Curso': '📚',
            'Modulo': '📖',
            'Leccion': '📝',
            'Recurso': '📎'
        };
        return iconos[tipo] || '📁';
    };

    const getTipoColor = (tipo) => {
        const colores = {
            'Curso': '#e94560',
            'Modulo': '#3b82f6',
            'Leccion': '#10b981',
            'Recurso': '#f59e0b'
        };
        return colores[tipo] || '#6b7280';
    };

    const renderRuta = (ruta) => {
        return ruta.join(' > ');
    };

    const renderResultado = (resultado) => {
        const { tipo, nodo, ruta } = resultado;
        
        return (
            <div key={`${tipo}-${nodo.id}`} className="search-result-item">
                <div className="result-header">
                    <span 
                        className="result-icon"
                        style={{ backgroundColor: getTipoColor(tipo) }}
                    >
                        {getTipoIcon(tipo)}
                    </span>
                    <div className="result-info">
                        <h4>{nodo.nombre}</h4>
                        <p className="result-type">Tipo: {tipo}</p>
                        <p className="result-path">Ruta: {renderRuta(ruta)}</p>
                    </div>
                </div>
                
                <div className="result-details">
                    {nodo.descripcion && (
                        <p><strong>Descripción:</strong> {nodo.descripcion}</p>
                    )}
                    {nodo.duracion_estimada && (
                        <p><strong>Duración:</strong> {nodo.duracion_estimada} minutos</p>
                    )}
                    {nodo.profundidad !== undefined && (
                        <p><strong>Profundidad:</strong> {nodo.profundidad}</p>
                    )}
                    {nodo.total_hijos !== undefined && (
                        <p><strong>Elementos hijos:</strong> {nodo.total_hijos}</p>
                    )}
                    {nodo.tipo && nodo.tipo === 'Recurso' && (
                        <div className="recurso-info">
                            <p><strong>Tipo de recurso:</strong> {nodo.tipo_recurso}</p>
                            {nodo.duracion && (
                                <p><strong>Duración:</strong> {nodo.duracion} min</p>
                            )}
                            <a 
                                href={nodo.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="recurso-link"
                            >
                                Ver recurso
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderEstructuraCompleta = () => {
        if (!estructuraCompleta) return null;

        return (
            <div className="estructura-completa">
                <h3>Estructura Jerárquica Completa</h3>
                <div className="estructura-stats">
                    <div className="stat-item">
                        <span className="stat-number">{estructuraCompleta.total_cursos}</span>
                        <span className="stat-label">Cursos</span>
                    </div>
                </div>
                
                <div className="cursos-tree">
                    {estructuraCompleta.cursos.map(curso => (
                        <div key={curso.id} className="curso-node">
                            <div className="node-header curso-header">
                                <span className="node-icon">📚</span>
                                <span className="node-title">{curso.nombre}</span>
                                <span className="node-count">{curso.hijos.length} módulos</span>
                            </div>
                            
                            <div className="modulos-container">
                                {curso.hijos.map(modulo => (
                                    <div key={modulo.id} className="modulo-node">
                                        <div className="node-header modulo-header">
                                            <span className="node-icon">📖</span>
                                            <span className="node-title">{modulo.nombre}</span>
                                            <span className="node-count">{modulo.hijos.length} lecciones</span>
                                        </div>
                                        
                                        <div className="lecciones-container">
                                            {modulo.hijos.map(leccion => (
                                                <div key={leccion.id} className="leccion-node">
                                                    <div className="node-header leccion-header">
                                                        <span className="node-icon">📝</span>
                                                        <span className="node-title">{leccion.nombre}</span>
                                                        <span className="node-count">
                                                            {leccion.recursos ? leccion.recursos.length : 0} recursos
                                                        </span>
                                                    </div>
                                                    
                                                    {leccion.recursos && leccion.recursos.length > 0 && (
                                                        <div className="recursos-container">
                                                            {leccion.recursos.map(recurso => (
                                                                <div key={recurso.id} className="recurso-node">
                                                                    <span className="node-icon">📎</span>
                                                                    <span className="node-title">{recurso.nombre}</span>
                                                                    <span className="recurso-type">{recurso.tipo}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="search-manager">
            <h2>Búsqueda en Estructura Jerárquica</h2>
            
            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'info'}`}>
                    {message}
                </div>
            )}

            <div className="search-panel">
                <form onSubmit={buscarContenido} className="search-form">
                    <div className="search-inputs">
                        <div className="search-group">
                            <label>Buscar en:</label>
                            <select 
                                value={selectedCurso} 
                                onChange={(e) => setSelectedCurso(e.target.value)}
                            >
                                <option value="">Todos los cursos</option>
                                {cursos.map(curso => (
                                    <option key={curso.ID_Curso} value={curso.ID_Curso}>
                                        {curso.Nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="search-group">
                            <label>Término de búsqueda:</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar cursos, módulos, lecciones, recursos..."
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="search-actions">
                        <button 
                            type="submit" 
                            disabled={loading || !searchTerm.trim()}
                            className="btn-search"
                        >
                            {loading ? 'Buscando...' : '🔍 Buscar'}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={cargarEstructuraCompleta}
                            disabled={loading}
                            className="btn-structure"
                        >
                            📊 Ver Estructura Completa
                        </button>
                    </div>
                </form>
            </div>

            <div className="results-panel">
                {searchResults.length > 0 && (
                    <div className="search-results">
                        <h3>Resultados de búsqueda ({searchResults.length})</h3>
                        <div className="results-list">
                            {searchResults.map(renderResultado)}
                        </div>
                    </div>
                )}

                {estructuraCompleta && (
                    <div className="estructura-panel">
                        {renderEstructuraCompleta()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchManager;
