import React, { useState, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

function GraphsPanel({ data }) {
  const [selected, setSelected] = useState('usuarios');

  // Colores y estilos para los nodos
  const nodeStyles = {
    admin: { background: '#e94560', color: '#fff', border: '2px solid #e94560', fontWeight: 700 },
    alumno: { background: '#1e90ff', color: '#fff', border: '2px solid #1e90ff', fontWeight: 700 },
    docente: { background: '#43d477', color: '#fff', border: '2px solid #43d477', fontWeight: 700 },
    curso: { background: '#f7b731', color: '#23272f', border: '2px solid #f7b731', fontWeight: 700 },
    modulo: { background: '#8854d0', color: '#fff', border: '2px solid #8854d0', fontWeight: 700 },
    leccion: { background: '#fd9644', color: '#fff', border: '2px solid #fd9644', fontWeight: 700 },
    material: { background: '#20c997', color: '#fff', border: '2px solid #20c997', fontWeight: 700 },
    evaluacion: { background: '#e94560', color: '#fff', border: '2px solid #e94560', fontWeight: 700 },
  };

  // Nodos y edges mejorados visualmente
  const graphData = useMemo(() => {
    if (selected === 'usuarios') {
      return {
        nodes: [
          { id: 'admin', data: { label: 'Administrador' }, position: { x: 300, y: 50 }, style: nodeStyles.admin },
          { id: 'alumno1', data: { label: 'Alumno: Juan Pérez' }, position: { x: 100, y: 200 }, style: nodeStyles.alumno },
          { id: 'alumno2', data: { label: 'Alumno: Ana Ruiz' }, position: { x: 250, y: 320 }, style: nodeStyles.alumno },
          { id: 'docente1', data: { label: 'Docente: M. López' }, position: { x: 500, y: 200 }, style: nodeStyles.docente },
        ],
        edges: [
          { id: 'e1', source: 'admin', target: 'alumno1', label: 'gestiona', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#e94560', strokeWidth: 2 } },
          { id: 'e2', source: 'admin', target: 'docente1', label: 'gestiona', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#e94560', strokeWidth: 2 } },
          { id: 'e3', source: 'docente1', target: 'alumno2', label: 'tutor', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#43d477', strokeWidth: 2 } },
        ],
      };
    }
    if (selected === 'cursos') {
      return {
        nodes: [
          { id: 'curso1', data: { label: 'Curso: Matemáticas' }, position: { x: 300, y: 50 }, style: nodeStyles.curso },
          { id: 'modulo1', data: { label: 'Módulo: Álgebra' }, position: { x: 200, y: 200 }, style: nodeStyles.modulo },
          { id: 'leccion1', data: { label: 'Lección: Ecuaciones' }, position: { x: 100, y: 350 }, style: nodeStyles.leccion },
          { id: 'modulo2', data: { label: 'Módulo: Geometría' }, position: { x: 400, y: 200 }, style: nodeStyles.modulo },
          { id: 'leccion2', data: { label: 'Lección: Triángulos' }, position: { x: 500, y: 350 }, style: nodeStyles.leccion },
        ],
        edges: [
          { id: 'e1', source: 'curso1', target: 'modulo1', label: 'contiene', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#f7b731', strokeWidth: 2 } },
          { id: 'e2', source: 'curso1', target: 'modulo2', label: 'contiene', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#f7b731', strokeWidth: 2 } },
          { id: 'e3', source: 'modulo1', target: 'leccion1', label: 'incluye', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8854d0', strokeWidth: 2 } },
          { id: 'e4', source: 'modulo2', target: 'leccion2', label: 'incluye', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8854d0', strokeWidth: 2 } },
        ],
      };
    }
    if (selected === 'evaluaciones') {
      return {
        nodes: [
          { id: 'eval1', data: { label: 'Evaluación: Parcial 1' }, position: { x: 200, y: 100 }, style: nodeStyles.evaluacion },
          { id: 'eval2', data: { label: 'Evaluación: Final' }, position: { x: 400, y: 250 }, style: nodeStyles.evaluacion },
        ],
        edges: [
          { id: 'e1', source: 'eval1', target: 'eval2', label: 'prerrequisito', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#e94560', strokeWidth: 2 } },
        ],
      };
    }
    if (selected === 'materiales') {
      return {
        nodes: [
          { id: 'mat1', data: { label: 'Material: PDF Álgebra' }, position: { x: 200, y: 100 }, style: nodeStyles.material },
          { id: 'leccion1', data: { label: 'Lección: Ecuaciones' }, position: { x: 350, y: 250 }, style: nodeStyles.leccion },
        ],
        edges: [
          { id: 'e1', source: 'mat1', target: 'leccion1', label: 'asociado', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#20c997', strokeWidth: 2 } },
        ],
      };
    }
    return { nodes: [], edges: [] };
  }, [selected]);

  return (
    <div className="admin-section">
      <h3>Visualización de Grafos</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <button className={`admin-btn${selected === 'usuarios' ? ' active' : ''}`} onClick={() => setSelected('usuarios')}>Usuarios</button>
        <button className={`admin-btn${selected === 'cursos' ? ' active' : ''}`} onClick={() => setSelected('cursos')}>Cursos</button>
        <button className={`admin-btn${selected === 'evaluaciones' ? ' active' : ''}`} onClick={() => setSelected('evaluaciones')}>Evaluaciones</button>
        <button className={`admin-btn${selected === 'materiales' ? ' active' : ''}`} onClick={() => setSelected('materiales')}>Materiales</button>
      </div>
      <div style={{ background: '#23272f', borderRadius: 10, padding: 24, color: '#bfc9d1', minHeight: 360, height: 400 }}>
        <ReactFlow nodes={graphData.nodes} edges={graphData.edges} fitView style={{ width: '100%', height: 340 }}>
          <MiniMap nodeColor={n => n.style?.background || '#888'} nodeStrokeWidth={3} style={{ width: 100, height: 60, borderRadius: 8 }} />
          <Controls showInteractive={false} />
          <Background gap={16} color="#aaa" />
        </ReactFlow>
      </div>
      <div style={{marginTop:12, color:'#bfc9d1', fontSize:15, textAlign:'center'}}>
        <b>Tip:</b> Los colores y flechas indican jerarquía y relaciones. Haz zoom o arrastra para explorar.
      </div>
    </div>
  );
}

export default GraphsPanel;
