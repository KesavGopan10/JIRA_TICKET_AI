

import React from 'react';
import { HistoryItem, TicketType } from '../types';

const TicketTypeBadge: React.FC<{ type: TicketType }> = ({ type }) => {
    const colors = {
        [TicketType.Bug]: 'bg-red-500/20 text-red-300 border-red-500/30',
        [TicketType.Story]: 'bg-green-500/20 text-green-300 border-green-500/30',
        [TicketType.Task]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        [TicketType.Epic]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[type]}`}>
            {type}
        </span>
    );
};

interface HistoryPanelProps {
    history: HistoryItem[];
    onLoad: (item: HistoryItem) => void;
    activeId: string | null;
    disabled: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, activeId, disabled }) => {
    return (
        <aside className="glass p-6 rounded-2xl shadow-lg border border-gray-700/30 lg:sticky lg:top-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">History</h2>
            </div>
            {history.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    <p className="text-sm">Your generated tickets will appear here.</p>
                    <p className="text-xs text-gray-400 mt-2">Start by generating your first ticket above.</p>
                </div>
            ) : (
                <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => onLoad(item)}
                                disabled={disabled}
                                className={`w-full text-left p-4 rounded-lg border cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-gray-900/50
                                    ${activeId === item.id 
                                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500 shadow-inner' 
                                        : 'bg-gray-900/50 hover:bg-gray-700/50 border-gray-700'
                                    }`
                                }
                            >
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <p className="font-semibold text-gray-200 break-words">{item.ticket.title}</p>
                                    <TicketTypeBadge type={item.ticketType} />
                                </div>
                                <p className="text-xs text-gray-500">
                                    {new Date(item.timestamp).toLocaleString()}
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

export default HistoryPanel;
