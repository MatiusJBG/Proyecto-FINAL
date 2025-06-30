import React from 'react';

export default function LessonViewer({ lessonId }) {
  // Aquí podrías cargar el contenido real de la lección
  return (
    <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginTop: 16 }}>
      <h4>Lección seleccionada</h4>
      <p>Mostrando contenido de la lección: <strong>{lessonId}</strong></p>
    </div>
  );
} 