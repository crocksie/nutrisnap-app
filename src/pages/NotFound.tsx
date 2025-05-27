import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="page-container not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i> Go Home
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
