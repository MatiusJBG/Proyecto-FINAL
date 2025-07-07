import React from 'react';
import './RecommendationCard.css';

export default function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;
  
  return (
    <div className="recommendation-card">
      <div className="recommendation-icon">{recommendation.icon}</div>
      <div className="recommendation-content">
        <div className="recommendation-message">{recommendation.message}</div>
        <div className="recommendation-reason">{recommendation.reason}</div>
      </div>
    </div>
  );
} 