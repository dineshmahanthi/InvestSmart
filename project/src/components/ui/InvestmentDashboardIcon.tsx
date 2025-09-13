import React from 'react';

interface InvestmentDashboardIconProps {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  animated?: boolean;
  className?: string;
}

const InvestmentDashboardIcon: React.FC<InvestmentDashboardIconProps> = ({
  size = 48, // Larger default size for feature icon
  primaryColor = '#1E40AF', // Tailwind blue-800
  accentColor = '#10B981', // Tailwind green-500
  animated = true,
  className = '',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`investment-dashboard-icon ${className}`}
    >
      {/* Background Dashboard Panel with Shadow */}
      <rect x="4" y="6" width="40" height="36" rx="3" fill="white" stroke={primaryColor} strokeWidth="2" />
      <rect x="4" y="6" width="40" height="8" rx="1" fill={primaryColor} />
      
      {/* Header Navigation Elements */}
      <circle cx="8" cy="10" r="1.5" fill="white" />
      <circle cx="13" cy="10" r="1.5" fill="white" />
      <circle cx="18" cy="10" r="1.5" fill="white" />
      
      {/* Dashboard Grid Layout */}
      <rect x="8" y="18" width="14" height="10" rx="1" stroke={primaryColor} strokeWidth="1.5" fill="white" />
      <rect x="26" y="18" width="14" height="10" rx="1" stroke={primaryColor} strokeWidth="1.5" fill="white" />
      <rect x="8" y="32" width="32" height="6" rx="1" stroke={primaryColor} strokeWidth="1.5" fill="white" />
      
      {/* Stock Chart Line */}
      <polyline 
        points="8,23 11,22 14,24 17,20 20,21" 
        stroke={accentColor} 
        strokeWidth="1.5" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "animate-chart" : ""}
      />
      
      {/* Donut Chart */}
      <circle cx="33" cy="23" r="5" stroke={primaryColor} strokeWidth="1.5" fill="white" />
      <path
        d="M33,18 A5,5 0 0 1 37.5,25.5"
        stroke={accentColor}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Bottom Bar Chart */}
      <rect x="12" y="34" width="2" height="2" fill={primaryColor} />
      <rect x="17" y="33" width="2" height="3" fill={primaryColor} />
      <rect x="22" y="34" width="2" height="2" fill={primaryColor} />
      <rect x="27" y="32" width="2" height="4" fill={accentColor} />
      <rect x="32" y="33" width="2" height="3" fill={primaryColor} />
      
      {/* CSS Animation for Chart Line (if animated) */}
      {animated && (
        <style>
          {`
          @keyframes chartAnimation {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
          }
          .animate-chart {
            stroke-dasharray: 20;
            stroke-dashoffset: 20;
            animation: chartAnimation 1.5s ease-in-out forwards;
          }
          `}
        </style>
      )}
    </svg>
  );
};

export default InvestmentDashboardIcon;
