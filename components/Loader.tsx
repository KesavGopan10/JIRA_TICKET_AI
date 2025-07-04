import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-2 animate-fade-in">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-900 border-t-blue-500 shadow-lg"></div>
                <div className="absolute inset-0 rounded-full border-2 border-gray-900 border-t-blue-500 opacity-50"></div>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-gray-300 text-base font-medium tracking-wide">AI is thinking...</span>
                <div className="w-32 h-1 bg-blue-500/30 rounded-full animate-pulse mt-2"></div>
            </div>
        </div>
    );
};

export default Loader;
