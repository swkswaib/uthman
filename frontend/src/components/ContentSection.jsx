import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getAllClasses, getStreamsForClass } from '../utils/schoolConfig';
import './ContentSection.css';

const ContentSection = ({ isMobile, sidebarOpen, schoolName = 'Uthman Primary School' }) => {
  const [stats, setStats] = useState({ totalPupils: 0, totalMarks: 0, classesWithData: 0, streamsWithData: 0 });
  const [classStats, setClassStats] = useState([]);
  const [recentPupils, setRecentPupils] = useState([]);
  const [classPupilCounts, setClassPupilCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [pupils, statistics] = await Promise.all([
        api.getPupils(),
        api.getStatistics({ term: 'Term 1', academicYear: '2025/2026' }).catch(() => null)
      ]);

      const pupilList = Array.isArray(pupils) ? pupils : [];

      // Count pupils per class
      const perClass = {};
      const classesSet = new Set();
      const streamsSet = new Set();
      pupilList.forEach(p => {
        perClass[p.class] = (perClass[p.class] || 0) + 1;
        classesSet.add(p.class);
        streamsSet.add(`${p.class}-${p.stream}`);
      });
      setClassPupilCounts(perClass);

      // Marks stats
      const marksCount = statistics?.totalMarksEntries || 0;
      const cStats = statistics?.classStats || [];

      setStats({
        totalPupils: pupilList.length,
        totalMarks: marksCount,
        classesWithData: classesSet.size,
        streamsWithData: streamsSet.size
      });

      setClassStats(cStats);

      // Recent pupils (last 8 registered)
      setRecentPupils(pupilList.slice(-8).reverse());
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  const allClasses = getAllClasses();
  const totalStreams = allClasses.reduce((sum, c) => sum + getStreamsForClass(c).length, 0);

  const cards = [
    { title: 'Registered Pupils', value: stats.totalPupils, icon: 'fas fa-user-graduate', color: 'green' },
    { title: 'Active Classes', value: `${stats.classesWithData} / ${allClasses.length}`, icon: 'fas fa-chalkboard', color: 'orange' },
    { title: 'Active Streams', value: `${stats.streamsWithData} / ${totalStreams}`, icon: 'fas fa-layer-group', color: 'purple' },
  ];

  return (
    <main className={`content-section ${sidebarOpen && isMobile ? 'sidebar-open' : ''}`}>
      {/* Welcome Header */}
      <div className="content-header">
        <div>
          <h1>Welcome to {schoolName}</h1>
          <p>Overview of registered pupils, marks entry, and results.</p>
        </div>
        <button className="new-project-btn" onClick={loadDashboardData} disabled={loading}>
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `var(--${card.color}-light)` }}>
              <i className={card.icon} style={{ color: `var(--${card.color})` }}></i>
            </div>
            <div className="stat-content">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pupils Per Class */}
      <div className="projects-section">
        <div className="section-header">
          <h2>Pupils Per Class</h2>
        </div>
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Registered Pupils</th>
                <th>Streams</th>
                <th>Avg Marks</th>
              </tr>
            </thead>
            <tbody>
              {allClasses.map(cls => {
                const streams = getStreamsForClass(cls);
                const pupilCount = classPupilCounts[cls] || 0;
                const classStat = classStats.find(s => s.class === cls || s._id === cls);
                return (
                  <tr key={cls}>
                    <td className="project-name">
                      <i className="fas fa-chalkboard" style={{ marginRight: 8, color: 'var(--green)' }}></i>
                      {cls}
                    </td>
                    <td>
                      <span className={`class-badge ${pupilCount > 0 ? '' : 'empty'}`}>
                        {pupilCount}
                      </span>
                    </td>
                    <td>{streams.map(s => s.name).join(', ')}</td>
                    <td>
                      {classStat ? (
                        <span className={`grade-badge ${classStat.avgMarks >= 60 ? 'green' : classStat.avgMarks >= 45 ? 'blue' : 'orange'}`}>
                          {classStat.avgMarks}%
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>\u2014</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom: Class Performance Chart + Recent Pupils */}
      <div className="bottom-section">
        <div className="chart-container">
          <div className="section-header">
            <h2>Class Performance (Term 1)</h2>
          </div>
          {classStats.length > 0 ? (
            <>
              <div className="chart-labels">
                {classStats.map(s => <span key={s._id || s.class}>{s._id || s.class}</span>)}
              </div>
              <div className="chart-placeholder">
                {classStats.map(s => (
                  <div
                    key={s._id || s.class}
                    className="chart-bar"
                    style={{ height: `${Math.min(s.avgMarks, 100)}%` }}
                    title={`${s._id || s.class}: ${s.avgMarks}%`}
                  ></div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
              <i className="fas fa-chart-bar" style={{ fontSize: 48, marginBottom: 12 }}></i>
              <p>No marks data yet. Enter marks to see class performance.</p>
            </div>
          )}
        </div>

        <div className="activity-container">
          <div className="section-header">
            <h2>Recently Registered Pupils</h2>
          </div>
          <div className="activity-list">
            {recentPupils.length > 0 ? recentPupils.map((p, i) => (
              <div key={p._id || i} className="activity-item">
                <div className="activity-avatar">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div className="activity-content">
                  <p><strong>{p.name}</strong></p>
                  <small>{p.class} \u2014 {p.stream} ({p.streamType === 'muslim' ? 'Muslim' : 'Non-Muslim'})</small>
                </div>
              </div>
            )) : (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                <i className="fas fa-user-plus" style={{ fontSize: 32, marginBottom: 8 }}></i>
                <p>No pupils registered yet. Go to Register Pupil to add students.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContentSection;
