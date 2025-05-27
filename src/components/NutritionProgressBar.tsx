import React from 'react';

interface NutritionProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const NutritionProgressBar: React.FC<NutritionProgressBarProps> = ({
  label,
  current,
  target,
  unit,
  color = 'primary'
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = current > target;
  const displayColor = isOver ? 'danger' : color;
  
  return (
    <div className="nutrition-progress-bar">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-values">
          {current.toFixed(1)} / {target.toFixed(0)} {unit}
        </span>
      </div>
      <div className="progress-bar-container">
        <div 
          className={`progress-bar progress-bar-${displayColor}`}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 15 && (
            <span className="progress-text">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
      {isOver && (
        <div className="progress-warning">
          ⚠️ {(current - target).toFixed(1)} {unit} over target
        </div>
      )}
    </div>
  );
};

export default NutritionProgressBar;
