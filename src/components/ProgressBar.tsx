import React from 'react';

interface ProgressBarProps {
  value: number;
  maxValue: number;
  label?: string;
  colorClass?: string;
  showPercentage?: boolean;
  height?: string;
  animate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  maxValue,
  label,
  colorClass = 'bg-blue-600',
  showPercentage = false,
  height = 'h-4',
  animate = false,
}) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  return (
    <div className="w-full">
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${colorClass} ${height} rounded-full ${animate ? 'transition-all duration-300' : ''}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="text-xs text-right mt-1">{Math.round(percentage)}%</div>
      )}
    </div>
  );
};

export default ProgressBar;