import React from 'react';

interface StoryIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const StoryIcon: React.FC<StoryIconProps> = ({ className = '', ...props }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`text-green-500 flex-shrink-0 ${className}`}
    {...props}
  >
    <rect width="24" height="24" rx="4" fill="currentColor"/>
    <path d="M8 6H16V18H8V6Z" fill="white" fillOpacity="0.3"/>
    <path d="M8 6V18H16V6H8ZM6 5C6 4.44772 6.44772 4 7 4H17C17.5523 4 18 4.44772 18 5V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V5Z" fill="white"/>
    <path d="M12 8H14" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
