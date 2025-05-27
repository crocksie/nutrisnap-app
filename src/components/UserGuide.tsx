import React from 'react';

interface UserGuideProps {
  step?: 'upload' | 'analyze' | 'nutrition' | 'log';
}

const UserGuide: React.FC<UserGuideProps> = ({ step = 'upload' }) => {
  const guides = {
    upload: {
      title: 'Upload Your Meal Photo',
      tips: [
        'Take photos in good lighting for better recognition',
        'Include the entire meal in the frame',
        'Avoid shadows and blurry images',
        'Multiple food items can be identified from one photo'
      ],
      icon: 'fas fa-camera'
    },
    analyze: {
      title: 'AI Food Recognition',
      tips: [
        'Our AI is analyzing your photo',
        'We\'ll identify all visible food items',
        'This usually takes just a few seconds',
        'Make sure your internet connection is stable'
      ],
      icon: 'fas fa-robot'
    },
    nutrition: {
      title: 'Get Nutrition Information',
      tips: [
        'Click on each identified food to get nutrition data',
        'Nutrition values are per standard serving',
        'You can add multiple items to create a complete meal',
        'Check that the identified foods match what you ate'
      ],
      icon: 'fas fa-chart-pie'
    },
    log: {
      title: 'Log Your Meal',
      tips: [
        'Review your meal summary before logging',
        'All selected items will be saved as one meal',
        'You can edit logged meals later if needed',
        'Your data is saved securely to your account'
      ],
      icon: 'fas fa-save'
    }
  };

  const guide = guides[step];

  return (
    <div className="user-guide">
      <div className="user-guide-header">
        <div className="user-guide-icon">
          <i className={guide.icon}></i>
        </div>
        <h3>{guide.title}</h3>
      </div>
      <ul className="user-guide-tips">
        {guide.tips.map((tip, index) => (
          <li key={index}>
            <i className="fas fa-check-circle"></i>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserGuide;
