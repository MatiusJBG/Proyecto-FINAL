import React, { useState, useEffect } from 'react';
import PanelLateral from './PanelLateral';
import ProgresoCurso from './ProgresoCurso';
import PanelCursoActual from './PanelCursoActual';
import TarjetaRecomendacion from './TarjetaRecomendacion';
import EvaluacionesPendientes from './EvaluacionesPendientes';
import PanelNotificaciones from './PanelNotificaciones';
import './dashboard.css';

export default function TableroEstudiante() {
  // Simulación de datos
  const [nombre, setNombre] = useState('Luis');
  const [curso, setCurso] = useState('Matemáticas 1');
  const [modulo, setModulo] = useState('Álgebra');
  const [leccion, setLeccion] = useState('Ecuaciones de primer grado');
  const [progreso, setProgreso] = useState(65);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [recomendacion, setRecomendacion] = useState({ mensaje: '', justificacion: '' });

  useEffect(() => {
    // Simular carga de evaluaciones pendientes
    setEvaluaciones([
      { id: 1, nombre: 'Evaluación Álgebra', estado: 'pendiente' },
      { id: 2, nombre: 'Evaluación Geometría', estado: 'retroalimentacion' },
    ]);
    // Simular notificaciones
    setNotificaciones([
      { id: 1, tipo: 'tutor', mensaje: 'Recuerda repasar la lección de Ecuaciones.' },
      { id: 2, tipo: 'recordatorio', mensaje: 'Tienes una evaluación pendiente.' },
    ]);
    // Simular árbol de decisión para recomendación
    const aproboUltima = false; // Simulación
    if (!aproboUltima) {
      setRecomendacion({
        mensaje: 'Te sugerimos repasar el módulo anterior antes de continuar.',
        justificacion: 'Basado en tu puntaje de la evaluación anterior.',
      });
    } else {
      setRecomendacion({
        mensaje: '¡Excelente! Puedes avanzar a la siguiente lección.',
        justificacion: 'Aprobaste la última evaluación.',
      });
    }
  }, []);

  const handleContinuar = () => {
    alert('Continuar donde te quedaste...');
  };

  const handleAccionEvaluacion = (id, estado) => {
    if (estado === 'pendiente') {
      alert('Presentar evaluación ' + id);
    } else {
      alert('Ver retroalimentación de evaluación ' + id);
    }
  };

  return (
    <div className="dashboard-root">
      <PanelLateral />
      <main className="dashboard-main">
        <h2 className="saludo">¡Hola, {nombre}!</h2>
        <div className="dashboard-grid">
          <ProgresoCurso progreso={progreso} nombreCurso={curso} />
          <PanelCursoActual curso={curso} modulo={modulo} leccion={leccion} onContinuar={handleContinuar} />
          <TarjetaRecomendacion mensaje={recomendacion.mensaje} justificacion={recomendacion.justificacion} />
          <EvaluacionesPendientes evaluaciones={evaluaciones} onAccion={handleAccionEvaluacion} />
          <PanelNotificaciones notificaciones={notificaciones} />
        </div>
      </main>
    </div>
  );
} 