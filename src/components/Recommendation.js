import React from 'react';

export default function Recommendation({ recommendation }) {
  if (!recommendation) return null;
  return (
    <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 8, marginBottom: 16 }}>
      <h4>Recomendación personalizada</h4>
      <p>Tu siguiente lección recomendada es: <strong>{recommendation.lessonName}</strong></p>
    </div>
  );
} 