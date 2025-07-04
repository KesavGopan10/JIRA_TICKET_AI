import React from 'react';
import { motion } from 'framer-motion';

interface ErrorCardProps {
    message: string;
    onClose: () => void;
    type?: 'api' | 'invalid' | 'default';
}

const ICONS = {
    api: (
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    invalid: (
        <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
    ),
    default: (
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const ErrorCard: React.FC<ErrorCardProps> = ({ message, onClose, type = 'default' }) => (
    <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="relative flex items-center gap-4 bg-gradient-to-r from-red-900/80 to-gray-900/80 border border-red-600/60 shadow-xl rounded-xl px-6 py-4 mb-4 overflow-hidden"
        role="alert"
    >
        <div>{ICONS[type] || ICONS.default}</div>
        <div className="flex-1 text-left">
            <span className="block text-base font-semibold text-red-200">{message}</span>
        </div>
        <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded-full text-red-300 hover:text-white hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Dismiss error"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <motion.div
            className="absolute bottom-0 left-0 h-1 bg-red-500"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
        />
    </motion.div>
);

export default ErrorCard;