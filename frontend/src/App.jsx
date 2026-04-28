import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ContentSection from './components/ContentSection';
import ReportCards from './pages/ReportCards';
import MarksEntry from './pages/MarksEntry';
import RegisterStudent from './pages/RegisterStudent';
import SystemConfiguration from './pages/SystemConfiguration';
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'grades':
        return <ReportCards />;
      case 'marks':
        return <MarksEntry />;
      case 'students':
        return <RegisterStudent />;
      case 'system-config':
        return <SystemConfiguration />;
      default:
        return <ContentSection isMobile={isMobile} sidebarOpen={sidebarOpen} />;
    }
  };

  return (
    <div className="app">
      <Navbar 
        isMobile={isMobile} 
        toggleSidebar={toggleSidebar} 
        sidebarOpen={sidebarOpen}
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
