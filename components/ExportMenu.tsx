import React, { useState, useEffect, useRef } from 'react';
import { GeneratedTicket, TicketType } from '../types';
import { formatTicketAsMarkdown } from '../utils';
import { EllipsisVerticalIcon } from './icons/EllipsisVerticalIcon';

interface ExportMenuProps {
    ticket: GeneratedTicket;
    type: TicketType;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ ticket, type }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const createAndDownloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const handleDownloadMarkdown = () => {
        const markdownContent = formatTicketAsMarkdown(ticket, type);
        createAndDownloadFile(markdownContent, `${ticket.title.replace(/ /g, '_')}.md`, 'text/markdown');
    };

    const handleDownloadJson = () => {
        const jsonContent = JSON.stringify(ticket, null, 2);
        createAndDownloadFile(jsonContent, `${ticket.title.replace(/ /g, '_')}.json`, 'application/json');
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                aria-label="Export options"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <EllipsisVerticalIcon />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={handleDownloadMarkdown}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                            >
                                Download as Markdown
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleDownloadJson}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                            >
                                Download as JSON
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ExportMenu;
