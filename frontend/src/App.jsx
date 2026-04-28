import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ContentSection from './components/ContentSection';
import ReportCards from './pages/ReportCards';
import MarksEntry from './pages/MarksEntry';
import RegisterStudent from './pages/RegisterStudent';
import SystemConfiguration from './pages/SystemConfiguration';
import { api } from './utils/api';
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [systemConfig, setSystemConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load system config on startup
  useEffect(() => {
    api.getSystemConfig()
      .then(data => { if (data && !data.message) setSystemConfig(data); })
      .catch(() => {})
      .finally(() => setConfigLoading(false));
  }, []);

  const handleConfigSaved = (config) => {
    setSystemConfig(config);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const isConfigured = systemConfig?.isConfigured === true;

  const renderPage = () => {
    switch (activePage) {
      case 'grades':
        return <ReportCards />;
      case 'marks':
        return <MarksEntry />;
      case 'students':
        return <RegisterStudent />;
      case 'system-config':
        return <SystemConfiguration onConfigSaved={handleConfigSaved} />;
      default:
        if (configLoading) {
          return (
            <div className="config-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading...</p>
            </div>
          );
        }
        if (!isConfigured) {
          return <SystemConfiguration onConfigSaved={handleConfigSaved} isSetupMode />;
        }
        return <ContentSection isMobile={isMobile} sidebarOpen={sidebarOpen} schoolName={systemConfig?.schoolName} />;
    }
  };

  return (
    <div className="app">
      <Navbar 
        isMobile={isMobile} 
        toggleSidebar={toggleSidebar} 
        sidebarOpen={sidebarOpen}
        schoolName={systemConfig?.schoolName}
      />
      
      <div className="main-container">
        <Sidebar 
          isMobile={isMobile} 
          isOpen={sidebarOpen} 
          closeSidebar={closeSidebar}
          activePage={activePage}
          onPageChange={setActivePage}
        />
        
        <main className="content-area">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
