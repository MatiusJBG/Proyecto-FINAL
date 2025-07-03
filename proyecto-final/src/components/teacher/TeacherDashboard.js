import React, { useState, useEffect } from 'react';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import TeacherCourses from './TeacherCourses';
import TeacherStudents from './TeacherStudents';
import TeacherAnalytics from './TeacherAnalytics';
import teacherApiService from '../../services/teacherApi';
import './TeacherDashboard.css';

function TeacherDashboard({ onLogout, userData }) {
  const [activeSection, setActiveSection] = useState('courses');
  const [teacherData, setTeacherData] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);
        const teacherId = userData?.id || 1;
        const teacherInfo = await teacherApiService.getTeacherInfo(teacherId);
        const stats = await teacherApiService.getTeacherStats(teacherId);
        setTeacherData({
          id: teacherInfo.ID_Profesor,
          name: teacherInfo.Nombre,
          email: teacherInfo.Correo_electronico,
          department: teacherInfo.Especialidad,
          registrationDate: teacherInfo.Fecha_registro,
        });
        setTeacherStats(teacherApiService.formatTeacherStats(stats));
      } catch (err) {
        setError('Error al cargar los datos del profesor.');
      } finally {
        setLoading(false);
      }
    };
    loadTeacherData();
  }, [userData]);

  if (loading) return <div className="teacher-dashboard-loading">Cargando...</div>;
  if (error) return <div className="teacher-dashboard-error">{error}</div>;
  if (!teacherData) return null;

  return (
    <div className="teacher-dashboard-container">
      <TeacherSidebar active={activeSection} setActive={setActiveSection} onLogout={onLogout} />
      <main className="teacher-dashboard-main">
        <TeacherHeader teacherData={teacherData} />
        <div className="teacher-dashboard-content">
          {activeSection === 'courses' && <TeacherCourses teacherId={teacherData.id} />}
          {activeSection === 'students' && <TeacherStudents teacherId={teacherData.id} />}
          {activeSection === 'analytics' && <TeacherAnalytics teacherId={teacherData.id} stats={teacherStats} />}
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;
