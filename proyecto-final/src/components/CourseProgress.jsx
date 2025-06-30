import React from 'react';
// Si tienes Recharts instalado, descomenta las siguientes líneas:
// import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';
import './StudentDashboard.css';

// Puedes cambiar a un gráfico circular si tienes Recharts
export default function CourseProgress({ progress }) {
  // const data = [{ name: 'Progreso', value: progress }];
  return (
    <div className="course-progress">
      <div className="progress-header">
        <FiTrendingUp />
        <span>Progreso general</span>
      </div>
      {/*
      <RadialBarChart width={120} height={120} cx={60} cy={60} innerRadius={40} outerRadius={55} barSize={12} data={data} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} fill="#2e7dff" />
      </RadialBarChart>
      */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <span className="progress-label">{progress}%</span>
      </div>
    </div>
  );
} 