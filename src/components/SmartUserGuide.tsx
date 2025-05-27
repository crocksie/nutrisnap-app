import React, { useState, useEffect } from 'react';

interface SmartUserGuideProps {
  step?: 'upload' | 'analyze' | 'nutrition' | 'log';
  userExperience?: 'new' | 'experienced' | 'expert';
  onDismiss?: () => void;
  onVideoWatch?: (videoId: string) => void;
}

const SmartUserGuide: React.FC<SmartUserGuideProps> = ({ 
  step = 'upload', 
  userExperience = 'new',
  onDismiss,
  onVideoWatch
}) => {  const [isExpanded, setIsExpanded] = useState(userExperience === 'new');
  const [showVideo, setShowVideo] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Handle video opening and tracking
  const handleVideoOpen = () => {
    setShowVideo(true);
    if (onVideoWatch) {
      onVideoWatch(guides[step].videoId);
    }
  };

  // Auto-hide for experienced users
  useEffect(() => {
    if (userExperience === 'experienced' || userExperience === 'expert') {
      setIsExpanded(false);
    }
  }, [userExperience]);

  const guides = {
    upload: {
      title: 'Upload Your Meal Photo',
      videoId: 'upload-demo', // Placeholder for actual video
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Demo URL - replace with actual tutorial
      quickTip: 'Take clear photos in good lighting for best results',
      detailedTips: [
        'Take photos in good lighting for better recognition',
        'Include the entire meal in the frame',
        'Avoid shadows and blurry images',
        'Multiple food items can be identified from one photo'
      ],
      icon: 'fas fa-camera',
      color: 'var(--color-interactive-blue)'
    },
    analyze: {
      title: 'AI Food Recognition',
      videoId: 'analyze-demo',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      quickTip: 'Our AI is analyzing your photo - this takes just a few seconds',
      detailedTips: [
        'Our AI is analyzing your photo',
        'We\'ll identify all visible food items',
        'This usually takes just a few seconds',
        'Make sure your internet connection is stable'
      ],
      icon: 'fas fa-robot',
      color: 'var(--color-interactive-purple)'
    },
    nutrition: {
      title: 'Get Nutrition Information',
      videoId: 'nutrition-demo',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      quickTip: 'Click each food item to add it to your meal',
      detailedTips: [
        'Click on each identified food to get nutrition data',
        'Nutrition values are per standard serving',
        'You can add multiple items to create a complete meal',
        'Check that the identified foods match what you ate'
      ],
      icon: 'fas fa-chart-pie',
      color: 'var(--color-interactive-green)'
    },
    log: {
      title: 'Log Your Meal',
      videoId: 'log-demo',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      quickTip: 'Review and save your complete meal',
      detailedTips: [
        'Review your meal summary before logging',
        'All selected items will be saved as one meal',
        'You can edit logged meals later if needed',
        'Your data is saved securely to your account'
      ],
      icon: 'fas fa-save',
      color: 'var(--color-interactive-orange)'
    }
  };

  const guide = guides[step];

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  // Compact view for experienced users
  if (userExperience === 'expert' && !isExpanded) {
    return (
      <div className="smart-guide compact" style={{ borderLeft: `3px solid ${guide.color}` }}>
        <div className="guide-compact-content">
          <div className="guide-icon-small">
            <i className={guide.icon}></i>
          </div>
          <span className="guide-quick-tip">{guide.quickTip}</span>
          <div className="guide-actions">
            <button 
              className="btn-link guide-help-btn" 
              onClick={() => setIsExpanded(true)}
              title="Show detailed help"
            >
              <i className="fas fa-question-circle"></i>
            </button>            <button 
              className="btn-link guide-video-btn" 
              onClick={handleVideoOpen}
              title="Watch tutorial"
            >
              <i className="fas fa-play-circle"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Experienced users get minimal guidance with expand option
  if (userExperience === 'experienced' && !isExpanded) {
    return (
      <div className="smart-guide minimal" style={{ borderLeft: `3px solid ${guide.color}` }}>
        <div className="guide-minimal-content">
          <div className="guide-icon-small">
            <i className={guide.icon}></i>
          </div>
          <span className="guide-step-title">{guide.title}</span>
          <div className="guide-actions">            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={handleVideoOpen}
            >
              <i className="fas fa-play"></i> Tutorial
            </button>
            <button 
              className="btn-link guide-expand-btn" 
              onClick={() => setIsExpanded(true)}
            >
              <i className="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full guidance for new users or when expanded
  return (
    <>
      <div className="smart-guide expanded" style={{ borderLeft: `3px solid ${guide.color}` }}>
        <div className="guide-header">
          <div className="guide-title-section">
            <div className="guide-icon" style={{ color: guide.color }}>
              <i className={guide.icon}></i>
            </div>
            <h3>{guide.title}</h3>
          </div>
          <div className="guide-header-actions">            <button 
              className="btn btn-sm btn-primary" 
              onClick={handleVideoOpen}
            >
              <i className="fas fa-play"></i> Watch Tutorial
            </button>
            {userExperience !== 'new' && (
              <button 
                className="btn-link guide-collapse-btn" 
                onClick={() => setIsExpanded(false)}
                title="Minimize"
              >
                <i className="fas fa-chevron-up"></i>
              </button>
            )}
            {onDismiss && (
              <button 
                className="btn-link guide-dismiss-btn" 
                onClick={() => {
                  setIsDismissed(true);
                  onDismiss();
                }}
                title="Hide guidance"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        
        <div className="guide-content">
          <div className="guide-quick-tip-section">
            <i className="fas fa-lightbulb"></i>
            <span>{guide.quickTip}</span>
          </div>
          
          <ul className="guide-detailed-tips">
            {guide.detailedTips.map((tip, index) => (
              <li key={index}>
                <i className="fas fa-check-circle"></i>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="video-modal-overlay" onClick={() => setShowVideo(false)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h4>{guide.title} - Tutorial</h4>
              <button 
                className="btn-link video-close-btn" 
                onClick={() => setShowVideo(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="video-container">
              <iframe
                src={guide.videoUrl}
                title={`${guide.title} Tutorial`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-modal-footer">
              <p className="text-muted">This short tutorial shows you how to {guide.title.toLowerCase()} effectively.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartUserGuide;
