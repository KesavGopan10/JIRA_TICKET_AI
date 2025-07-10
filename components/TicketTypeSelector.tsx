import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BugIcon } from './icons/BugIcon';
import { StoryIcon } from './icons/StoryIcon';
import { TaskIcon } from './icons/TaskIcon';
import { EpicIcon } from './icons/EpicIcon';
import { TicketType } from '../types';
import { TICKET_TYPES } from '../constants';

interface TicketTypeSelectorProps {
    selectedType: TicketType;
    onSelectType: (type: TicketType) => void;
    disabled?: boolean;
}

const typeColors = {
    [TicketType.Story]: 'from-emerald-500 to-teal-500',
    [TicketType.Bug]: 'from-rose-500 to-pink-500',
    [TicketType.Task]: 'from-blue-500 to-indigo-500',
    [TicketType.Epic]: 'from-purple-500 to-fuchsia-500',
};


const TicketTypeSelector: React.FC<TicketTypeSelectorProps> = ({ selectedType, onSelectType, disabled = false }) => {
    const [pillStyle, setPillStyle] = useState<{ width: number; left: number } | null>(null);
    const buttonsRef = useRef<Map<TicketType, HTMLButtonElement>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updatePill = () => {
            const button = buttonsRef.current.get(selectedType);
            if (button) {
                setPillStyle({
                    width: button.offsetWidth,
                    left: button.offsetLeft,
                });
            }
        };

        updatePill();
        const timeoutId = setTimeout(updatePill, 50);
        return () => clearTimeout(timeoutId);
    }, [selectedType]);

    useEffect(() => {
        const handleResize = () => {
            const button = buttonsRef.current.get(selectedType);
            if (button) {
                setPillStyle({
                    width: button.offsetWidth,
                    left: button.offsetLeft,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedType]);

    const getIcon = (type: TicketType) => {
        const iconProps = {
            className: `w-4 h-4 ${selectedType === type ? 'text-white' : 'text-gray-400'}`
        };
        
        switch (type.toLowerCase()) {
            case 'bug':
                return <BugIcon {...iconProps} />;
            case 'story':
                return <StoryIcon {...iconProps} />;
            case 'task':
                return <TaskIcon {...iconProps} />;
            case 'epic':
                return <EpicIcon {...iconProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-2">
            <div 
                ref={containerRef} 
                className={`relative flex w-fit items-center p-1 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 shadow-inner overflow-hidden transition-all duration-300 ${
                    disabled ? 'opacity-60' : 'opacity-100'
                }`}
            >
                <AnimatePresence>
                    {pillStyle && (
                        <motion.div
                            key="pill"
                            className={`absolute bg-gradient-to-r ${typeColors[selectedType]} rounded-lg h-[calc(100%-0.5rem)] top-1 shadow-lg`}
                            initial={false}
                            animate={{
                                width: pillStyle.width,
                                x: pillStyle.left,
                                opacity: disabled ? 0.7 : 1,
                            }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 300,
                            }}
                        />
                    )}
                </AnimatePresence>
                
                {TICKET_TYPES.map((type) => {
                    const isSelected = selectedType === type;
                    return (
                        <motion.button
                            key={type}
                            ref={(el) => {
                                if (el) buttonsRef.current.set(type, el);
                                else buttonsRef.current.delete(type);
                            }}
                            onClick={() => !disabled && onSelectType(type)}
                            className={`relative z-10 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-out flex items-center gap-2 focus:outline-none ${
                                isSelected 
                                    ? 'text-white' 
                                    : `text-gray-400 ${!disabled ? 'hover:text-gray-200 hover:bg-gray-700/30' : ''}`
                            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={disabled}
                            whileHover={!disabled && !isSelected ? { scale: 1.05 } : {}}
                            whileTap={!disabled ? { scale: 0.98 } : {}}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={type + (isSelected ? 'selected' : 'unselected')}
                                    initial={{ opacity: 0, x: isSelected ? 5 : -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isSelected ? -5 : 5 }}
                                    className="flex items-center gap-2"
                                >
                                    {getIcon(type)}
                                    <span className="font-medium">
                                        {type}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>
            <motion.p 
                className="text-xs text-gray-400 pl-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {selectedType === TicketType.Bug && 'Report an issue or unexpected behavior'}
                {selectedType === TicketType.Story && 'Describe a new feature or enhancement'}
                {selectedType === TicketType.Task && 'Define work that needs to be done'}
                {selectedType === TicketType.Epic && 'Group related user stories into larger initiatives'}
            </motion.p>
        </div>
    );
};

export default TicketTypeSelector;
