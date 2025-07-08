import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

function GraphsPanel({ data }) {
  const [selected, setSelected] = useState('usuarios');
  const [estudiantesPorCurso, setEstudiantesPorCurso] = useState({});
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [profesores, setProfesores] = useState([]);
  const [cursosPorProfesor, setCursosPorProfesor] = useState({});
  const [loadingProfesores, setLoadingProfesores] = useState(false);
  const [cursosCompletos, setCursosCompletos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para recargar todos los datos
  const recargarDatos = useCallback(async () => {
    setIsRefreshing(true);
    setLastUpdate(Date.now());
    
    if (selected === 'usuarios') {
      await cargarProfesoresYCursos();
    } else if (selected === 'cursos') {
      await cargarCursosCompletos();
    }
    
    setIsRefreshing(false);
  }, [selected]);

  // Cargar profesores y sus cursos
  useEffect(() => {
    if (selected === 'usuarios') {
      cargarProfesoresYCursos();
    }
  }, [selected, lastUpdate]);

  // Cargar cursos completos con módulos y lecciones
  useEffect(() => {
    if (selected === 'cursos') {
      cargarCursosCompletos();
    }
  }, [selected, lastUpdate]);

  const cargarCursosCompletos = async () => {
    setLoadingCursos(true);
    try {
      // Obtener todos los cursos básicos
      const responseCursos = await fetch('http://localhost:5000/api/cursos');
      if (responseCursos.ok) {
        const cursosBasicos = await responseCursos.json();
        
        // Para cada curso, obtener sus módulos (que ya incluyen lecciones y evaluaciones)
        const cursosConDetalles = await Promise.all(
          cursosBasicos.map(async (curso) => {
            try {
              // Obtener módulos del curso (ya incluye lecciones y evaluaciones)
              const responseModulos = await fetch(`http://localhost:5000/api/cursos/${curso.ID_Curso}/modulos`);
              let modulos = [];
              if (responseModulos.ok) {
                modulos = await responseModulos.json();
                // Los módulos ya vienen con lecciones y evaluaciones incluidas
                console.log(`Curso ${curso.Nombre}: ${modulos.length} módulos cargados`);
                modulos.forEach(modulo => {
                  console.log(`  Módulo ${modulo.Nombre}: ${modulo.lecciones?.length || 0} lecciones`);
                  modulo.lecciones?.forEach(leccion => {
                    console.log(`    Lección ${leccion.Nombre}: ${leccion.evaluaciones?.length || 0} evaluaciones`);
                  });
                });
              }
              return { ...curso, modulos };
            } catch (error) {
              console.error(`Error cargando módulos para curso ${curso.ID_Curso}:`, error);
              return { ...curso, modulos: [] };
            }
          })
        );
        
        setCursosCompletos(cursosConDetalles);
      }
    } catch (error) {
      console.error('Error cargando cursos completos:', error);
    } finally {
      setLoadingCursos(false);
    }
  };

  const cargarProfesoresYCursos = async () => {
    setLoadingProfesores(true);
    try {
      // Obtener todos los profesores
      const responseProfesores = await fetch('http://localhost:5000/api/profesores');
      if (responseProfesores.ok) {
        const profesoresData = await responseProfesores.json();
        setProfesores(profesoresData);
        
        // Para cada profesor, obtener sus cursos
        const cursosData = {};
        for (const profesor of profesoresData) {
          try {
            const responseCursos = await fetch(`http://localhost:5000/api/profesor/${profesor.ID_Profesor}/cursos`);
            if (responseCursos.ok) {
              const cursos = await responseCursos.json();
              cursosData[profesor.ID_Profesor] = cursos;
            } else {
              cursosData[profesor.ID_Profesor] = [];
            }
          } catch (error) {
            console.error(`Error cargando cursos para profesor ${profesor.ID_Profesor}:`, error);
            cursosData[profesor.ID_Profesor] = [];
          }
        }
        setCursosPorProfesor(cursosData);
      }
    } catch (error) {
      console.error('Error cargando profesores:', error);
    } finally {
      setLoadingProfesores(false);
    }
  };

  // Cargar estudiantes para cada curso
  useEffect(() => {
    if (selected === 'usuarios' && Object.keys(cursosPorProfesor).length > 0) {
      cargarEstudiantesPorCurso();
    }
  }, [selected, cursosPorProfesor, lastUpdate]);

  const cargarEstudiantesPorCurso = async () => {
    setLoadingEstudiantes(true);
    const estudiantesData = {};
    
    try {
      // Para cada profesor y sus cursos, obtener estudiantes
      for (const [profesorId, cursos] of Object.entries(cursosPorProfesor)) {
        for (const curso of cursos) {
          try {
            const response = await fetch(`http://localhost:5000/api/profesor/${profesorId}/cursos/${curso.ID_Curso}/estudiantes`);
            if (response.ok) {
              const estudiantes = await response.json();
              estudiantesData[curso.ID_Curso] = estudiantes;
            }
          } catch (error) {
            console.error(`Error cargando estudiantes para curso ${curso.ID_Curso}:`, error);
            estudiantesData[curso.ID_Curso] = [];
          }
        }
      }
      setEstudiantesPorCurso(estudiantesData);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  // Actualización automática cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (selected === 'usuarios') {
        recargarDatos();
      } else if (selected === 'cursos') {
        recargarDatos();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [selected, recargarDatos]);

  // Colores y estilos mejorados para los nodos
  const nodeStyles = {
    admin: { 
      background: '#e94560', 
      color: '#fff', 
      border: '3px solid #e94560', 
      fontWeight: 700,
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(233, 69, 96, 0.3)'
    },
    alumno: { 
      background: '#1e90ff', 
      color: '#fff', 
      border: '3px solid #1e90ff', 
      fontWeight: 700,
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(30, 144, 255, 0.3)'
    },
    docente: { 
      background: '#43d477', 
      color: '#fff', 
      border: '3px solid #43d477', 
      fontWeight: 700,
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(67, 212, 119, 0.3)'
    },
    curso: { 
      background: '#f7b731', 
      color: '#23272f', 
      border: '3px solid #f7b731', 
      fontWeight: 700,
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(247, 183, 49, 0.3)'
    },
    modulo: { 
      background: '#8854d0', 
      color: '#fff', 
      border: '3px solid #8854d0', 
      fontWeight: 700,
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(136, 84, 208, 0.3)'
    },
    leccion: { 
      background: '#fd9644', 
      color: '#fff', 
      border: '3px solid #fd9644', 
      fontWeight: 700,
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(253, 150, 68, 0.3)'
    },
    evaluacion: { 
      background: '#e94560', 
      color: '#fff', 
      border: '3px solid #e94560', 
      fontWeight: 700,
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(233, 69, 96, 0.3)'
    },
  };

  // Nodos y edges mejorados visualmente
  const graphData = useMemo(() => {
    if (!data || !data.cursos) return { nodes: [], edges: [] };

    // Grafo de usuarios mejorado: docentes, cursos y estudiantes
    if (selected === 'usuarios') {
      let nodes = [];
      let edges = [];
      
      // Crear layout mejorado con estudiantes
      const centerX = 600;
      const startY = 100;
      const spacingX = 500;
      const spacingY = 200;

      profesores.forEach((profesor, profIdx) => {
        const profesorId = `profesor_${profesor.ID_Profesor}`;
        const profesorX = centerX + (profIdx - (profesores.length - 1) / 2) * spacingX;
        const profesorY = startY;
        
        // Nodo del profesor
        nodes.push({ 
          id: profesorId, 
          data: { 
            label: `👨‍🏫 ${profesor.Nombre}`,
            type: 'profesor'
          }, 
          position: { x: profesorX, y: profesorY }, 
          style: nodeStyles.docente 
        });

        // Cursos del profesor
        const cursos = cursosPorProfesor[profesor.ID_Profesor] || [];
        cursos.forEach((curso, cursoIdx) => {
          const cursoId = `curso_${curso.ID_Curso}`;
          const cursoX = profesorX + (cursoIdx - (cursos.length - 1) / 2) * 300;
          const cursoY = profesorY + spacingY;
          
          nodes.push({ 
            id: cursoId, 
            data: { 
              label: `📚 ${curso.Nombre}`,
              type: 'curso'
            }, 
            position: { x: cursoX, y: cursoY }, 
            style: nodeStyles.curso 
          });
          
          // Conexión profesor -> curso
          edges.push({ 
            id: `e_${profesorId}_${cursoId}`, 
            source: profesorId, 
            target: cursoId, 
            label: 'imparte', 
            markerEnd: { type: MarkerType.ArrowClosed }, 
            style: { 
              stroke: '#43d477', 
              strokeWidth: 3,
              strokeDasharray: '5,5'
            },
            labelStyle: {
              fill: '#43d477',
              fontWeight: 600,
              fontSize: '12px'
            }
          });

          // Estudiantes del curso
          const estudiantes = estudiantesPorCurso[curso.ID_Curso] || [];
          estudiantes.forEach((estudiante, estudianteIdx) => {
            const estudianteId = `estudiante_${curso.ID_Curso}_${estudiante.ID_Estudiante}`;
            const estudianteX = cursoX + (estudianteIdx - (estudiantes.length - 1) / 2) * 180;
            const estudianteY = cursoY + spacingY;
            
            nodes.push({ 
              id: estudianteId, 
              data: { 
                label: `👤 ${estudiante.Nombre}`,
                type: 'estudiante'
              }, 
              position: { x: estudianteX, y: estudianteY }, 
              style: nodeStyles.alumno 
            });
            
            // Conexión curso -> estudiante
            edges.push({ 
              id: `e_${cursoId}_${estudianteId}`, 
              source: cursoId, 
              target: estudianteId, 
              label: 'matriculado', 
              markerEnd: { type: MarkerType.ArrowClosed }, 
              style: { 
                stroke: '#1e90ff', 
                strokeWidth: 2
              },
              labelStyle: {
                fill: '#1e90ff',
                fontWeight: 600,
                fontSize: '11px'
              }
            });
          });
        });
      });

      return { nodes, edges };
    }

    // Grafo de cursos mejorado: estructura jerárquica completa
    if (selected === 'cursos') {
      let nodes = [];
      let edges = [];
      
      // Usar cursosCompletos en lugar de data.cursos
      const cursos = cursosCompletos.length > 0 ? cursosCompletos : data.cursos;
      const startY = 100;
      const spacingY = 180;
      const minSpacingX = 220;

      // Función recursiva para calcular posiciones y construir nodos/edges
      function layoutTree(node, type, parentId, depth, xOffset) {
        let children = [];
        let label = '';
        let id = '';
        let style = {};
        let nodeType = type;
        let subtrees = [];
        let width = minSpacingX;
        let y = startY + depth * spacingY;

        if (type === 'curso') {
          id = `curso_${node.ID_Curso || node.id}`;
          label = `📚 ${node.Nombre || node.nombre}`;
          style = nodeStyles.curso;
          if (Array.isArray(node.modulos)) {
            children = node.modulos.map(m => ({ node: m, type: 'modulo' }));
          }
        } else if (type === 'modulo') {
          id = `modulo_${parentId}_${node.ID_Modulo || node.id}`;
          label = `📖 ${node.Nombre || node.nombre}`;
          style = nodeStyles.modulo;
          if (Array.isArray(node.lecciones)) {
            children = node.lecciones.map(l => ({ node: l, type: 'leccion' }));
          }
        } else if (type === 'leccion') {
          id = `leccion_${parentId}_${node.ID_Leccion || node.id}`;
          label = `📝 ${node.Nombre || node.nombre}`;
          style = nodeStyles.leccion;
          if (Array.isArray(node.evaluaciones)) {
            children = node.evaluaciones.map((e, idx) => ({ node: e, type: 'evaluacion', idx }));
          }
        } else if (type === 'evaluacion') {
          id = `evaluacion_${parentId}_${node.ID_Evaluacion || node.id || node.idx}`;
          label = `📊 ${node.Nombre || node.nombre || node.titulo || `Evaluación ${(node.idx || 0) + 1}`}`;
          style = nodeStyles.evaluacion;
        }

        // Calcular subárboles
        if (children.length > 0) {
          let totalWidth = 0;
          let childPositions = [];
          children.forEach((child, i) => {
            const subtree = layoutTree(child.node, child.type, id, depth + 1, xOffset + totalWidth);
            subtrees.push(subtree);
            childPositions.push(xOffset + totalWidth + subtree.width / 2);
            totalWidth += subtree.width + minSpacingX;
          });
          width = Math.max(totalWidth - minSpacingX, minSpacingX);
          // Centrar este nodo sobre sus hijos
          const centerX = childPositions.length > 0 ? (childPositions[0] + childPositions[childPositions.length - 1]) / 2 : xOffset;
          nodes.push({ id, data: { label, type: nodeType }, position: { x: centerX, y }, style });
          // Edges
          subtrees.forEach(sub => {
            edges.push({
              id: `e_${id}_${sub.id}`,
              source: id,
              target: sub.id,
              label: type === 'curso' ? 'contiene' : type === 'modulo' ? 'incluye' : type === 'leccion' ? 'evalúa' : '',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: {
                stroke: type === 'curso' ? '#f7b731' : type === 'modulo' ? '#8854d0' : '#fd9644',
                strokeWidth: 3
              },
              labelStyle: {
                fill: type === 'curso' ? '#f7b731' : type === 'modulo' ? '#8854d0' : '#fd9644',
                fontWeight: 600,
                fontSize: '12px'
              }
            });
          });
          return { id, width, centerX };
        } else {
          // Nodo hoja
          nodes.push({ id, data: { label, type: nodeType }, position: { x: xOffset, y }, style });
          return { id, width, centerX: xOffset };
        }
      }

      // Layout para todos los cursos
      let totalWidth = 0;
      let cursoCenters = [];
      cursos.forEach((curso, idx) => {
        const subtree = layoutTree(curso, 'curso', '', 0, totalWidth);
        cursoCenters.push(subtree.centerX);
        totalWidth += subtree.width + minSpacingX * 2;
      });

      // Ajustar todos los nodos para centrar el grafo
      const graphCenter = cursoCenters.length > 0 ? (cursoCenters[0] + cursoCenters[cursoCenters.length - 1]) / 2 : 0;
      nodes.forEach(n => { n.position.x = n.position.x - graphCenter + 600; });

      return { nodes, edges };
    }

    return { nodes: [], edges: [] };
  }, [selected, data, profesores, cursosPorProfesor, estudiantesPorCurso, cursosCompletos, lastUpdate]);

  // Estadísticas para mostrar información adicional
  const stats = useMemo(() => {
    if (!data || !data.cursos) return { totalCursos: 0, totalDocentes: 0, totalModulos: 0, totalLecciones: 0, totalEvaluaciones: 0, totalEstudiantes: 0 };
    
    const docentes = new Set();
    let totalModulos = 0;
    let totalLecciones = 0;
    let totalEvaluaciones = 0;
    let totalEstudiantes = 0;
    
    // Usar cursosCompletos para estadísticas más precisas
    const cursosParaEstadisticas = selected === 'cursos' && cursosCompletos.length > 0 ? cursosCompletos : data.cursos;
    
    cursosParaEstadisticas.forEach(curso => {
      if (curso.docente) docentes.add(curso.docente);
      if (Array.isArray(curso.modulos)) {
        totalModulos += curso.modulos.length;
        curso.modulos.forEach(modulo => {
          if (Array.isArray(modulo.lecciones)) {
            totalLecciones += modulo.lecciones.length;
            modulo.lecciones.forEach(leccion => {
              if (Array.isArray(leccion.evaluaciones)) {
                totalEvaluaciones += leccion.evaluaciones.length;
              }
            });
          }
        });
      }
      // Contar estudiantes del curso
      const estudiantes = estudiantesPorCurso[curso.ID_Curso || curso.id] || [];
      totalEstudiantes += estudiantes.length;
    });
    
    return {
      totalCursos: cursosParaEstadisticas.length,
      totalDocentes: profesores.length,
      totalModulos,
      totalLecciones,
      totalEvaluaciones,
      totalEstudiantes
    };
  }, [data, profesores, estudiantesPorCurso, cursosCompletos, selected, lastUpdate]);

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h3>Visualización de Grafos</h3>
        <button 
          onClick={recargarDatos}
          disabled={isRefreshing}
          style={{
            background: isRefreshing ? '#666' : '#43d477',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          {isRefreshing ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
              Actualizando...
            </>
          ) : (
            <>
              🔄 Actualizar Datos
            </>
          )}
        </button>
      </div>
      
      {/* Estadísticas rápidas */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 20, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #43d477, #2ecc71)', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: 600 
        }}>
          👨‍🏫 {stats.totalDocentes} Docentes
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #f7b731, #f39c12)', 
          color: '#23272f', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: 600 
        }}>
          📚 {stats.totalCursos} Cursos
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #1e90ff, #3498db)', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: 600 
        }}>
          👤 {stats.totalEstudiantes} Estudiantes
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #8854d0, #9b59b6)', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: 600 
        }}>
          📖 {stats.totalModulos} Módulos
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #fd9644, #e67e22)', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: 600 
        }}>
          📝 {stats.totalLecciones} Lecciones
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #e94560, #c0392b)', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: 600 
        }}>
          📊 {stats.totalEvaluaciones} Evaluaciones
        </div>
      </div>

      {/* Pestañas mejoradas */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 20,
        justifyContent: 'center',
        background: '#2b2f38',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid #353b48'
      }}>
        <button 
          className={`admin-btn${selected === 'usuarios' ? ' active' : ''}`} 
          onClick={() => setSelected('usuarios')}
          style={{
            background: selected === 'usuarios' ? '#43d477' : 'transparent',
            color: selected === 'usuarios' ? '#fff' : '#bfc9d1',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px'
          }}
        >
          👥 Usuarios y Docentes
        </button>
        <button 
          className={`admin-btn${selected === 'cursos' ? ' active' : ''}`} 
          onClick={() => setSelected('cursos')}
          style={{
            background: selected === 'cursos' ? '#f7b731' : 'transparent',
            color: selected === 'cursos' ? '#23272f' : '#bfc9d1',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px'
          }}
        >
          📚 Estructura de Cursos
        </button>
      </div>

      {/* Indicadores de carga */}
      {(selected === 'usuarios' && (loadingProfesores || loadingEstudiantes)) || 
       (selected === 'cursos' && loadingCursos) && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          color: '#bfc9d1',
          background: '#2b2f38',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #353b48'
        }}>
          🔄 {loadingProfesores ? 'Cargando profesores y cursos...' : 
              loadingCursos ? 'Cargando estructura completa de cursos...' : 
              'Cargando información de estudiantes...'}
        </div>
      )}

      {/* Área del grafo mejorada */}
      <div style={{ 
        background: 'linear-gradient(135deg, #23272f, #2b2f38)', 
        borderRadius: 16, 
        padding: 20, 
        color: '#bfc9d1', 
        minHeight: 600, 
        height: 800,
        border: '2px solid #353b48',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <ReactFlow 
          nodes={graphData.nodes} 
          edges={graphData.edges} 
          fitView 
          style={{ width: '100%', height: 760 }}
          fitViewOptions={{ 
            padding: 0.3,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.5
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.3}
          maxZoom={2.0}
          nodeExtent={[
            [0, 0],
            [2000, 1500]
          ]}
        >
          <MiniMap 
            nodeColor={n => n.style?.background || '#888'} 
            nodeStrokeWidth={3} 
            style={{ 
              width: 150,
              height: 100,
              borderRadius: 12,
              border: '2px solid #353b48'
            }} 
          />
          <Controls 
            showInteractive={false}
            style={{
              background: '#2b2f38',
              border: '1px solid #353b48',
              borderRadius: '8px'
            }}
          />
          <Background 
            gap={30}
            color="#444" 
            size={1}
          />
        </ReactFlow>
      </div>

      {/* Información adicional */}
      <div style={{
        marginTop: 16, 
        color: '#bfc9d1', 
        fontSize: 14, 
        textAlign: 'center',
        background: '#2b2f38',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #353b48'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#e94560' }}>
          💡 Información de Navegación
        </div>
        <div style={{ lineHeight: 1.6 }}>
          <span style={{ color: '#43d477' }}>🖱️ Arrastra</span> para mover nodos • 
          <span style={{ color: '#f7b731' }}> 🔍 Zoom</span> con la rueda del mouse • 
          <span style={{ color: '#8854d0' }}> 📍 MiniMapa</span> para navegación rápida • 
          <span style={{ color: '#fd9644' }}> 🎯 Controles</span> para ajustar vista
        </div>
        {selected === 'usuarios' && (
          <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
            <span style={{ color: '#43d477' }}>👨‍🏫 Docentes</span> → 
            <span style={{ color: '#f7b731' }}> 📚 Cursos</span> → 
            <span style={{ color: '#1e90ff' }}> 👤 Estudiantes</span>
          </div>
        )}
        {selected === 'cursos' && (
          <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
            <span style={{ color: '#f7b731' }}>📚 Cursos</span> → 
            <span style={{ color: '#8854d0' }}> 📖 Módulos</span> → 
            <span style={{ color: '#fd9644' }}> 📝 Lecciones</span> → 
            <span style={{ color: '#e94560' }}> 📊 Evaluaciones</span>
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: '12px', color: '#43d477' }}>
          ⏰ Actualización automática cada 30 segundos • Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GraphsPanel;
