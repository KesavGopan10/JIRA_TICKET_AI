import React, { useState, useEffect, useRef } from 'react';
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

        updatePill(); // Initial update

        // A timeout helps ensure the pill position is correct after initial render and potential layout shifts.
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
        switch (type.toLowerCase()) {
            case 'bug':
                return <BugIcon />;
            case 'story':
                return <StoryIcon />;
            case 'task':
                return <TaskIcon />;
            case 'epic':
                return <EpicIcon />;
            default:
                return null;
        }
    };

    return (
        <div ref={containerRef} className="relative flex w-fit items-center p-1 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-900/10 border border-gray-700/30">
            {pillStyle && (
                <div
                    className="absolute bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full h-[calc(100%-0.5rem)] top-1 transition-all duration-300 ease-in-out shadow-lg"
                    style={{ width: `${pillStyle.width}px`, transform: `translateX(${pillStyle.left}px)` }}
                />
            )}
            {TICKET_TYPES.map((type) => (
                <button
                    ref={(el) => {
                        if (el) buttonsRef.current.set(type, el);
                        else buttonsRef.current.delete(type);
                    }}
                    key={type}
                    onClick={() => !disabled && onSelectType(type)}
                    className={`relative z-10 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ease-in-out flex items-center gap-2 focus:outline-none 
                    ${selectedType === type 
                        ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/20'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2">
                        {getIcon(type)}
                        <span className="transition-transform duration-300" style={{
                            transform: selectedType === type ? 'translateX(2px)' : 'translateX(0)'
                        }}>
                            {type}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default TicketTypeSelector;
