import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon } from './icons/TrashIcon';

interface RequirementInputProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    disabled: boolean;
}

const RequirementInput: React.FC<RequirementInputProps> = ({ value, onChange, onClear, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        setCharCount(value.length);
    }, [value]);

    const placeholderText = "Describe your requirement in detail...\n\nExample: 'The login page is broken on mobile. When a user tries to log in with valid credentials on a small screen, they encounter a 500 error.'";

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <motion.label 
                    htmlFor="requirement" 
                    className="text-lg font-semibold text-gray-200 flex items-center gap-2.5"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold shadow-md">1</span>
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        What's the requirement?
                    </span>
                </motion.label>
                <AnimatePresence>
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClear}
                            className="p-1.5 rounded-full text-gray-400 hover:text-red-400 transition-colors duration-200 disabled:opacity-50"
                            disabled={disabled}
                            aria-label="Clear input"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
            <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <textarea
                    id="requirement"
                    rows={6}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholderText}
                    className={`w-full p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl text-gray-100 placeholder-gray-500 
                        transition-all duration-300 ease-out resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50
                        ${isFocused ? 'border-blue-500/50' : 'border-gray-700/50'} 
                        border-2 shadow-lg ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={disabled}
                    maxLength={1000}
                />
                <motion.div 
                    className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full transition-colors duration-200"
                    animate={{
                        backgroundColor: charCount > 900 
                            ? 'rgba(239, 68, 68, 0.2)' 
                            : charCount > 800 
                                ? 'rgba(234, 179, 8, 0.2)' 
                                : 'rgba(255, 255, 255, 0.05)',
                        color: charCount > 900 ? '#f87171' : charCount > 800 ? '#facc15' : '#9ca3af'
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {charCount}/1000
                </motion.div>
            </motion.div>
            <motion.p 
                className="text-xs text-gray-400 mt-1.5 pl-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.4 }}
            >
                Be as detailed as possible for better results. Include error messages, steps to reproduce, and expected behavior.
            </motion.p>
        </div>
    );
};

export default RequirementInput;