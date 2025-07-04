import React from 'react';
import { TrashIcon } from './icons/TrashIcon';

interface RequirementInputProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    disabled: boolean;
}

const RequirementInput: React.FC<RequirementInputProps> = ({ value, onChange, onClear, disabled }) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label htmlFor="requirement" className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">1.</span>
                    Describe your Requirement
                </label>
                {value && (
                    <button
                        onClick={onClear}
                        className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50"
                        disabled={disabled}
                        aria-label="Clear input"
                    >
                        <TrashIcon />
                    </button>
                )}
            </div>
            <div className="relative">
                <textarea
                    id="requirement"
                    rows={6}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="e.g., 'The login page is broken on mobile. When a user tries to log in with a valid username and password on a small screen, they get a 500 error and the page crashes.'"
                    className="w-full p-4 bg-gray-900/70 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                    disabled={disabled}
                    maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    {value.length} / 1000
                </div>
            </div>
        </div>
    );
};

export default RequirementInput;