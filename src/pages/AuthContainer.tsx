import React, { ReactNode } from 'react';
import { Bus } from 'lucide-react';

interface AuthContainerProps {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ 
  title, 
  children, 
  showBackButton = false, 
  onBackClick 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Bus className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
        </div>
        
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
};