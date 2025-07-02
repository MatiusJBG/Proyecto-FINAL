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
  // Construcción dinámica de grafos con datos reales
  const graphData = useMemo(() => {
    if (!data || !data.cursos) return { nodes: [], edges: [] };

    // Grafo de usuarios: docentes y cursos
    if (selected === 'usuarios') {
      let nodes = [];
      let edges = [];
      let docentes = {};
      let x = 100;
      let yDocente = 50;
      let yCurso = 200;
      // Agrupar cursos por docente
      data.cursos.forEach((curso, idx) => {
        const docente = curso.docente || 'Sin docente';
        if (!docentes[docente]) {
          docentes[docente] = { id: `docente_${docente.replace(/\s/g, '_')}_${idx}`, nombre: docente, cursos: [] };
        }
        docentes[docente].cursos.push(curso);
      });
      let docIdx = 0;
      Object.values(docentes).forEach((doc) => {
        const docenteId = doc.id;
        nodes.push({ id: docenteId, data: { label: `Docente: ${doc.nombre}` }, position: { x: x + docIdx * 250, y: yDocente }, style: nodeStyles.docente });
        doc.cursos.forEach((curso, cIdx) => {
          const cursoId = `curso_${curso.id}`;
          nodes.push({ id: cursoId, data: { label: `Curso: ${curso.nombre}` }, position: { x: x + docIdx * 250 + cIdx * 120, y: yCurso }, style: nodeStyles.curso });
          edges.push({ id: `e_docente_curso_${docenteId}_${curso.id}`, source: docenteId, target: cursoId, label: 'imparte', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#43d477', strokeWidth: 2 } });
        });
        docIdx++;
      });
      return { nodes, edges };
    }

    // Grafo: Curso -> Módulo -> Lección
    if (selected === 'cursos') {
      let nodes = [];
      let edges = [];
      let yCurso = 50;
      let yModulo = 200;
      let yLeccion = 350;
      let x = 100;
      data.cursos.forEach((curso, idx) => {
        const cursoId = `curso_${curso.id}`;
        nodes.push({ id: cursoId, data: { label: `Curso: ${curso.nombre}` }, position: { x: x + idx * 250, y: yCurso }, style: nodeStyles.curso });
        if (Array.isArray(curso.modulos)) {
          curso.modulos.forEach((modulo, mIdx) => {
            const moduloId = `modulo_${curso.id}_${modulo.id}`;
            nodes.push({ id: moduloId, data: { label: `Módulo: ${modulo.nombre}` }, position: { x: x + idx * 250 + mIdx * 120, y: yModulo }, style: nodeStyles.modulo });
            edges.push({ id: `e_curso_modulo_${curso.id}_${modulo.id}`, source: cursoId, target: moduloId, label: 'contiene', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#f7b731', strokeWidth: 2 } });
            if (Array.isArray(modulo.lecciones)) {
              modulo.lecciones.forEach((leccion, lIdx) => {
                const leccionId = `leccion_${curso.id}_${modulo.id}_${leccion.id}`;
                nodes.push({ id: leccionId, data: { label: `Lección: ${leccion.nombre}` }, position: { x: x + idx * 250 + mIdx * 120 + lIdx * 60, y: yLeccion }, style: nodeStyles.leccion });
                edges.push({ id: `e_modulo_leccion_${curso.id}_${modulo.id}_${leccion.id}`, source: moduloId, target: leccionId, label: 'incluye', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8854d0', strokeWidth: 2 } });
              });
            }
          });
        }
      });
      return { nodes, edges };
    }

    // Grafo de evaluaciones reales (por curso)
    if (selected === 'evaluaciones') {
      let nodes = [];
      let edges = [];
      let yCurso = 50;
      let yEval = 200;
      let x = 100;
      data.cursos.forEach((curso, idx) => {
        const cursoId = `curso_${curso.id}`;
        nodes.push({ id: cursoId, data: { label: `Curso: ${curso.nombre}` }, position: { x: x + idx * 250, y: yCurso }, style: nodeStyles.curso });
        if (Array.isArray(curso.evaluaciones)) {
          curso.evaluaciones.forEach((evalua, eIdx) => {
            const evalId = `eval_${curso.id}_${evalua.id || eIdx}`;
            nodes.push({ id: evalId, data: { label: `Evaluación: ${evalua.nombre}` }, position: { x: x + idx * 250 + eIdx * 120, y: yEval }, style: nodeStyles.evaluacion });
            edges.push({ id: `e_curso_eval_${curso.id}_${evalua.id || eIdx}`, source: cursoId, target: evalId, label: 'tiene', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#e94560', strokeWidth: 2 } });
          });
        }
      });
      return { nodes, edges };
    }

    return { nodes: [], edges: [] };
  }, [selected, data]);

  return (
    <div className="admin-section">
      <h3>Visualización de Grafos</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <button className={`admin-btn${selected === 'usuarios' ? ' active' : ''}`} onClick={() => setSelected('usuarios')}>Usuarios</button>
        <button className={`admin-btn${selected === 'cursos' ? ' active' : ''}`} onClick={() => setSelected('cursos')}>Cursos</button>
        <button className={`admin-btn${selected === 'evaluaciones' ? ' active' : ''}`} onClick={() => setSelected('evaluaciones')}>Evaluaciones</button>
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
