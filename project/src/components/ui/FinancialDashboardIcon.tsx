import React from 'react';

interface FinancialDashboardIconProps {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

const FinancialDashboardIcon: React.FC<FinancialDashboardIconProps> = ({
  size = 24,
  primaryColor = 'currentColor',
  secondaryColor = '#3B82F6', // Tailwind blue-600
  className = '',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={primaryColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`financial-dashboard-icon ${className}`}
    >
      {/* Base Dashboard Layout */}
      <rect x="2" y="3" width="20" height="18" rx="2" />
      
      {/* Top Header Bar */}
      <line x1="2" y1="7" x2="22" y2="7" />
      
      {/* Chart Elements */}
      <polyline 
        points="6,16 10,12 14,14 18,10" 
        stroke={secondaryColor} 
        fill="none"
        strokeWidth="2" 
      />
      
      {/* Financial Indicators */}
      <circle cx="6" cy="16" r="1" fill={secondaryColor} />
      <circle cx="10" cy="12" r="1" fill={secondaryColor} />
      <circle cx="14" cy="14" r="1" fill={secondaryColor} />
      <circle cx="18" cy="10" r="1" fill={secondaryColor} />
    </svg>
  );
};

export default FinancialDashboardIcon;
