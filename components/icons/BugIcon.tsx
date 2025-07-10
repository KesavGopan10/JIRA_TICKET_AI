import React from 'react';

interface BugIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const BugIcon: React.FC<BugIconProps> = ({ className = '', ...props }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`text-red-500 flex-shrink-0 ${className}`}
    {...props}
  >
    <rect width="24" height="24" rx="4" fill="currentColor"/>
    <path d="M8 12.5C8 12.5 8.5 11 12 11C15.5 11 16 12.5 16 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 9.5L16 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 9.5L8 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 11V15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 15H14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
