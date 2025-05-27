import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  return (
    <div className="app-card quick-actions-card">
      <div className="app-card-header">
        <h3>Quick Actions</h3>
      </div>
      <div className="app-card-content">
        <div className="quick-actions-grid">
          <Link to="/upload" className="quick-action-item">
            <div className="quick-action-icon">
              <i className="fas fa-camera"></i>
            </div>
            <div className="quick-action-content">
              <h4>Log New Meal</h4>
              <p>Take a photo and log your food</p>
            </div>
          </Link>
          
          <Link to="/history" className="quick-action-item">
            <div className="quick-action-icon">
              <i className="fas fa-history"></i>
            </div>
            <div className="quick-action-content">
              <h4>View History</h4>
              <p>Browse your meal history</p>
            </div>
          </Link>
          
          <Link to="/profile" className="quick-action-item">
            <div className="quick-action-icon">
              <i className="fas fa-user-cog"></i>
            </div>
            <div className="quick-action-content">
              <h4>Update Goals</h4>
              <p>Set your nutrition targets</p>
            </div>
          </Link>
          
          <div className="quick-action-item quick-action-info">
            <div className="quick-action-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <div className="quick-action-content">
              <h4>Tip of the Day</h4>
              <p>Take photos in good lighting for better food recognition</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
