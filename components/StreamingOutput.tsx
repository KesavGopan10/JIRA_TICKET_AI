import React from 'react';
import { motion } from 'framer-motion';

interface StreamingOutputProps {
    text: string;
}

const AnimatedDots: React.FC = () => (
    <span className="inline-block ml-1">
        <motion.span
            className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mx-0.5"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
        />
        <motion.span
            className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mx-0.5"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
        />
        <motion.span
            className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mx-0.5"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
        />
    </span>
);

const StreamingOutput: React.FC<StreamingOutputProps> = ({ text }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-xl shadow-lg animate-fade-in">
            <div className="whitespace-pre-wrap font-mono text-gray-300">
                {text}
                <AnimatedDots />
            </div>
        </div>
    );
};

export default StreamingOutput;
