import React from 'react';

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="progress-steps">
      <div className="progress-steps-container">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`progress-step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'current' : ''}`}
          >
            <div className="step-number">
              {index <= currentStep ? (
                index === currentStep ? (
                  <span>{index + 1}</span>
                ) : (
                  <i className="fas fa-check"></i>
                )
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
