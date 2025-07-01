import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import TeacherApp from './TeacherApp';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TeacherApp />
  </React.StrictMode>
); 