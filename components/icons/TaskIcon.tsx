import React from 'react';

interface TaskIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const TaskIcon: React.FC<TaskIconProps> = ({ className = '', ...props }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`text-blue-500 flex-shrink-0 ${className}`}
    {...props}
  >
    <rect width="24" height="24" rx="4" fill="currentColor"/>
    <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
