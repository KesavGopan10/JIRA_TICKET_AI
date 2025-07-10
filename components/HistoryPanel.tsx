import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HistoryItem, TicketType } from '../types';
import { BugIcon } from './icons/BugIcon';
import { StoryIcon } from './icons/StoryIcon';
import { TaskIcon } from './icons/TaskIcon';
import { EpicIcon } from './icons/EpicIcon';
import { SearchIcon, XIcon, ClockIcon } from './icons';
import { EllipsisVerticalIcon } from './icons/EllipsisVerticalIcon';

// Helper functions
const getTypeColor = (type: TicketType, variant: 'bg' | 'text' | 'border'): string => {
    const colors = {
        [TicketType.Bug]: {
            bg: 'bg-red-500/20',
            text: 'text-red-300',
            border: 'border-red-500/30'
        },
        [TicketType.Story]: {
            bg: 'bg-green-500/20',
            text: 'text-green-300',
            border: 'border-green-500/30'
        },
        [TicketType.Task]: {
            bg: 'bg-blue-500/20',
            text: 'text-blue-300',
            border: 'border-blue-500/30'
        },
        [TicketType.Epic]: {
            bg: 'bg-purple-500/20',
            text: 'text-purple-300',
            border: 'border-purple-500/30'
        },
    };
    return colors[type][variant];
};

const getTypeIcon = (type: TicketType, className = 'w-4 h-4'): React.ReactNode => {
    const icons = {
        [TicketType.Bug]: <BugIcon className={className} aria-hidden="true" />,
        [TicketType.Story]: <StoryIcon className={className} aria-hidden="true" />,
        [TicketType.Task]: <TaskIcon className={className} aria-hidden="true" />,
        [TicketType.Epic]: <EpicIcon className={className} aria-hidden="true" />,
    };
    return icons[type];
};

interface HistoryPanelProps {
    history: HistoryItem[];
    onLoad: (item: HistoryItem) => void;
    activeId: string | null;
    disabled: boolean;
}

const getTicketSummary = (item: HistoryItem) => {
    if (item.ticket.description) {
        return item.ticket.description.split('\n')[0].slice(0, 60) + (item.ticket.description.length > 60 ? '…' : '');
    }
    if (item.requirement) {
        return item.requirement.split('\n')[0].slice(0, 60) + (item.requirement.length > 60 ? '…' : '');
    }
    return '';
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, activeId, disabled }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<TicketType | 'all'>('all');
    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);
    const [historyState, setHistoryState] = useState(history);

    useEffect(() => {
        setHistoryState(history);
        itemRefs.current = [];
    }, [history]);

    const filteredHistory = useMemo(() => {
        return historyState.filter(item => {
            const matchesSearch = item.ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.requirement.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType === 'all' || item.ticketType === selectedType;
            return matchesSearch && matchesType;
        });
    }, [historyState, searchQuery, selectedType]);

    useEffect(() => {
        setFocusedIdx(null);
    }, [searchQuery, selectedType, filteredHistory.length]);

    useEffect(() => {
        if (focusedIdx !== null && itemRefs.current[focusedIdx]) {
            itemRefs.current[focusedIdx]?.focus();
        }
    }, [focusedIdx]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!filteredHistory.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIdx(idx => idx === null ? 0 : Math.min(idx + 1, filteredHistory.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIdx(idx => idx === null ? filteredHistory.length - 1 : Math.max(idx - 1, 0));
        } else if ((e.key === 'Enter' || e.key === ' ') && focusedIdx !== null) {
            e.preventDefault();
            onLoad(filteredHistory[focusedIdx]);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedType('all');
    };

    const handleCopy = (item: HistoryItem) => {
        navigator.clipboard.writeText(item.ticket.title + '\n' + (item.ticket.description || ''));
    };

    const handleExport = (_item: HistoryItem) => {
        alert('Export not implemented yet.');
    };

    const handleDelete = (item: HistoryItem) => {
        const updated = historyState.filter(h => h.id !== item.id);
        setHistoryState(updated);
        localStorage.setItem('jiraTicketHistory', JSON.stringify(updated));
        setMenuOpenIdx(null);
    };

    return (
        <aside
            className="glass p-6 rounded-2xl shadow-lg border border-gray-700/30 flex flex-col"
            style={{ height: '525px' }}
        >
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Ticket History</h2>
                    <span className="text-xs bg-gray-800/50 text-gray-400 px-2 py-1 rounded-full">
                        {filteredHistory.length} {filteredHistory.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
                {/* Search */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                        placeholder="Search history..."
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            aria-label="Clear search"
                        >
                            <XIcon className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                        </button>
                    )}
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setSelectedType('all')}
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${
                            selectedType === 'all'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-700/50'
                        }`}
                    >
                        All
                    </button>
                    {Object.values(TicketType).map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${
                                selectedType === type
                                    ? `${getTypeColor(type, 'bg')} ${getTypeColor(type, 'text')} ${getTypeColor(type, 'border')}`
                                    : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-700/50'
                            }`}
                        >
                            {getTypeIcon(type, 'h-3 w-3')}
                            {type}
                        </button>
                    ))}
                    {(searchQuery || selectedType !== 'all') && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                            <XIcon className="h-3 w-3" />
                            Clear filters
                        </button>
                    )}
                </div>
            </div>
            {/* Main List */}
            {filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 py-10 flex-1">
                    <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                        <ClockIcon className="w-8 h-8 text-cyan-500/60 mx-auto" />
                    </div>
                    {history.length === 0 ? (
                        <>
                            <p className="text-sm font-medium text-gray-300">No history yet</p>
                            <p className="text-xs text-gray-400 mt-1">Your generated tickets will appear here</p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-gray-300">No matching tickets found</p>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                            <button
                                onClick={clearFilters}
                                className="mt-3 text-xs px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/70 text-cyan-400 rounded-md"
                            >
                                <XIcon className="h-3 w-3" />
                                Clear filters
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <ul
                    className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1"
                    ref={listRef}
                    role="list"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#4b5563 #1f2937',
                        msOverflowStyle: 'none',
                    }}
                >
                    {filteredHistory.map((item, idx) => (
                        <li key={item.id} role="listitem">
                            <div className="relative group">
                                <button
                                    onClick={() => onLoad(item)}
                                    disabled={disabled}
                                    aria-current={activeId === item.id ? 'true' : undefined}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative group
                                        ${activeId === item.id
                                            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/50 shadow-lg'
                                            : 'bg-gray-900/50 hover:bg-gray-700/50 border-gray-700 hover:border-gray-600'
                                        }
                                        ${focusedIdx === idx ? 'ring-2 ring-cyan-400 ring-offset-2 z-10' : ''}`}
                                    ref={el => itemRefs.current[idx] = el}
                                    onFocus={() => setFocusedIdx(idx)}
                                    tabIndex={focusedIdx === idx ? 0 : -1}
                                >
                                    {activeId === item.id && (
                                        <span className="absolute left-0 top-0 h-full w-1 bg-cyan-400 rounded-l-lg"></span>
                                    )}
                                    <div className="flex justify-between items-start gap-3 pr-8">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`${getTypeColor(item.ticketType, 'text')} ${getTypeColor(item.ticketType, 'bg')} ${getTypeColor(item.ticketType, 'border')} p-0.5 rounded-md`}>
                                                    {getTypeIcon(item.ticketType, 'h-3.5 w-3.5')}
                                                </span>
                                                <p className="font-semibold text-gray-100 break-words line-clamp-2 text-left">
                                                    {item.ticket.title}
                                                </p>
                                            </div>
                                            {getTicketSummary(item) && (
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{getTicketSummary(item)}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 z-20 p-1 rounded-full bg-gray-800/70 hover:bg-gray-700/90"
                                    onClick={e => { e.stopPropagation(); setMenuOpenIdx(idx === menuOpenIdx ? null : idx); }}
                                    aria-label="Open actions menu"
                                >
                                    <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
                                </button>
                                {menuOpenIdx === idx && (
                                    <div className="absolute right-2 top-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-30 min-w-[120px] animate-fade-in">
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                                            onClick={() => { handleCopy(item); setMenuOpenIdx(null); }}
                                        >Copy</button>
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                                            onClick={() => { handleExport(item); setMenuOpenIdx(null); }}
                                        >Export</button>
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900"
                                            onClick={() => handleDelete(item)}
                                        >Delete</button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

export default HistoryPanel;
