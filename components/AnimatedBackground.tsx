import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black" />
        </motion.div>

        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
                duration: 20,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'reverse',
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/40 to-transparent rounded-full filter blur-3xl"
        />

        <motion.div
            animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
                duration: 25,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 5,
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-cyan-500/40 to-transparent rounded-full filter blur-3xl"
        />
    </div>
);

export default AnimatedBackground;