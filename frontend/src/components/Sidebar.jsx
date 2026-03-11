import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './Sidebar.css';

const Sidebar = ({ isMobile, isOpen, closeSidebar, activePage, onPageChange }) => {

  const visibleIds = ['dashboard', 'students', 'marks', 'grades'];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'students', label: 'Register Pupil', icon: 'fas fa-user-graduate' },
    { id: 'teachers', label: 'Teachers', icon: 'fas fa-chalkboard-teacher' },
    { id: 'classes', label: 'Classes', icon: 'fas fa-chalkboard' },
    { id: 'attendance', label: 'Attendance', icon: 'fas fa-clipboard-check' },
    { id: 'marks', label: 'Enter Marks', icon: 'fas fa-edit' },
    { id: 'grades', label: 'Grades & Results', icon: 'fas fa-poll' },
    { id: 'timetable', label: 'Timetable', icon: 'fas fa-calendar-week' },
    { id: 'library', label: 'Library', icon: 'fas fa-book-open' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' },
  ].filter(item => visibleIds.includes(item.id));

  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({ pupils: 0, marks: 0 });

  useEffect(() => {
    loadRecentData();
  }, []);

  const loadRecentData = async () => {
    try {
      const [pupils, statistics] = await Promise.all([
        api.getPupils().catch(() => []),
        api.getStatistics({ term: 'Term 1', academicYear: '2025/2026' }).catch(() => null)
      ]);

      const pupilList = Array.isArray(pupils) ? pupils : [];
      const marksCount = statistics?.totalMarksEntries || 0;

      setStats({ pupils: pupilList.length, marks: marksCount });

      const activities = [];

      // Count per class
      const classCounts = {};
      pupilList.forEach(p => { classCounts[p.class] = (classCounts[p.class] || 0) + 1; });
      const classesUsed = Object.keys(classCounts).length;

      if (pupilList.length > 0) {
        activities.push({
          icon: 'fas fa-user-graduate',
          text: `${pupilList.length} pupil${pupilList.length !== 1 ? 's' : ''} registered`,
          detail: `across ${classesUsed} class${classesUsed !== 1 ? 'es' : ''}`
        });
      }

      if (marksCount > 0) {
        const classesWithMarks = statistics?.classStats?.length || 0;
        activities.push({
          icon: 'fas fa-edit',
          text: `${marksCount} marks entered`,
          detail: `in ${classesWithMarks} class${classesWithMarks !== 1 ? 'es' : ''}`
        });
      }

      // Recent pupils
      const recent = pupilList.slice(-3).reverse();
      recent.forEach(p => {
        activities.push({
          icon: 'fas fa-user-plus',
          text: `${p.name}`,
          detail: `${p.class} \u2014 ${p.stream}`
        });
      });

      if (activities.length === 0) {
        activities.push({
          icon: 'fas fa-info-circle',
          text: 'No data yet',
          detail: 'Register pupils to get started'
        });
      }

      setRecentActivities(activities);
    } catch (err) {
      setRecentActivities([{ icon: 'fas fa-exclamation-circle', text: 'Could not load updates', detail: 'Check server connection' }]);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <aside className={`sidebar ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h3>School Menu</h3>
          {isMobile && (
            <button className="close-sidebar" onClick={closeSidebar}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Main Menu */}
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">MANAGEMENT</h4>
          <ul className="sidebar-menu">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onPageChange(item.id);
                    if (isMobile) closeSidebar();
                  }}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        
        {/* Recent Activity */}
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">RECENT UPDATES</h4>
          <div className="recent-activities">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <i className={activity.icon} style={{ color: '#2e7d32', marginRight: '8px', fontSize: '0.85rem', minWidth: '16px' }}></i>
                <div className="activity-content">
                  <p>{activity.text}</p>
                  <small>{activity.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="storage-info">
            <div className="storage-bar">
              <div className="storage-fill" style={{ width: stats.marks > 0 ? '100%' : stats.pupils > 0 ? '50%' : '0%' }}></div>
            </div>
            <p>{stats.pupils} Pupils \u00b7 {stats.marks} Marks</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
