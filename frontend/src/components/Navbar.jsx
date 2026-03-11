import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ isMobile, toggleSidebar, sidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Mobile Menu Button */}
        <div className="navbar-left">
          {isMobile && (
            <button 
              className="mobile-menu-btn" 
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          )}
          
          <div className="logo">
            <i className="fas fa-school"></i>
            <span>Uthman Primary School</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Search - full bar on desktop, icon toggle on mobile */}
          {isMobile ? (
            <>
              <button
                className="icon-btn"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                aria-label="Search"
              >
                <i className="fas fa-search"></i>
              </button>
            </>
          ) : (
            <form className="search-container" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search students, classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>
          )}

          {/* User Profile */}
          <div className="user-profile">
            <i className="fas fa-user-circle" style={{ fontSize: '2rem', color: '#fff' }}></i>
            {!isMobile && <span className="user-name">Admin</span>}
          </div>
        </div>
      </div>

      {/* Mobile search bar - slides down when toggled */}
      {isMobile && showMobileSearch && (
        <form className="mobile-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search students, classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          <button type="submit" className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </form>
      )}
    </nav>
  );
};

export default Navbar;
