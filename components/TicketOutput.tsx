import React, { useState, useCallback } from 'react';
import { GeneratedTicket, TicketType, BugTicket, StoryTicket, EpicTicket, TaskTicket } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { BugIcon } from './icons/BugIcon';
import { StoryIcon } from './icons/StoryIcon';
import { TaskIcon } from './icons/TaskIcon';
import { EpicIcon } from './icons/EpicIcon';
import { formatTicketAsMarkdown } from '../utils';
import ExportMenu from './ExportMenu';
import Loader from './Loader';

interface TicketOutputProps {
    ticket: GeneratedTicket;
    type: TicketType;
    imageBase64: string | null;
    onRefine: (instruction: string) => void;
    isRefining: boolean;
    onCopyToast?: () => void;
}

const TICKET_VISUALS = {
    [TicketType.Bug]: { icon: BugIcon, color: "border-red-500", name: "Bug" },
    [TicketType.Story]: { icon: StoryIcon, color: "border-green-500", name: "Story" },
    [TicketType.Task]: { icon: TaskIcon, color: "border-blue-500", name: "Task" },
    [TicketType.Epic]: { icon: EpicIcon, color: "border-purple-500", name: "Epic" },
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
        <div className="text-gray-300 space-y-2">{children}</div>
    </div>
);

const TicketOutput: React.FC<TicketOutputProps> = ({ ticket, type, imageBase64, onRefine, isRefining, onCopyToast }) => {
    const [copied, setCopied] = useState(false);
    const [refineInstruction, setRefineInstruction] = useState('');

    const handleCopy = useCallback(() => {
        const textToCopy = formatTicketAsMarkdown(ticket, type);
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        if (onCopyToast) onCopyToast();
        setTimeout(() => setCopied(false), 2000);
    }, [ticket, type, onCopyToast]);

    const handleRefineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!refineInstruction.trim() || isRefining) return;
        onRefine(refineInstruction);
        setRefineInstruction('');
    }

    const { icon: Icon, color, name } = TICKET_VISUALS[type] || TICKET_VISUALS[TicketType.Task];

    const renderTicketContent = () => {
        switch (type) {
            case TicketType.Bug:
                const bug = ticket as BugTicket;
                return (
                     <div className="space-y-4">
                        {bug.priority && <Section title="Priority"><span className={`px-2 py-1 text-xs font-bold rounded-full ${bug.priority === 'High' ? 'bg-red-500/30 text-red-200' : bug.priority === 'Medium' ? 'bg-yellow-500/30 text-yellow-200' : 'bg-green-500/30 text-green-200'}`}>{bug.priority}</span></Section>}
                        {bug.description && <Section title="Description"><p>{bug.description}</p></Section>}
                        {bug.stepsToReproduce?.length > 0 && (
                             <Section title="Steps to Reproduce">
                                <ol className="list-decimal list-inside space-y-1 text-gray-300">{bug.stepsToReproduce.map((step, i) => <li key={i}>{step}</li>)}</ol>
                            </Section>
                        )}
                        {bug.expectedBehavior && <Section title="Expected Behavior"><p>{bug.expectedBehavior}</p></Section>}
                        {bug.actualBehavior && <Section title="Actual Behavior"><p>{bug.actualBehavior}</p></Section>}
                        {imageBase64 && (
                            <Section title="Attached Screenshot">
                                <img src={imageBase64} alt="Attached screenshot" className="rounded-lg max-w-full h-auto border border-gray-600" />
                            </Section>
                        )}
                    </div>
                );
            case TicketType.Story:
                const story = ticket as StoryTicket;
                return (
                     <div className="space-y-4">
                        {story.description && <Section title="User Story"><p className="italic text-gray-300">{story.description}</p></Section>}
                        {story.acceptanceCriteria?.length > 0 && (
                            <Section title="Acceptance Criteria">
                                <ul className="list-disc list-inside space-y-1 text-gray-300">{story.acceptanceCriteria.map((ac, i) => <li key={i}>{ac}</li>)}</ul>
                            </Section>
                        )}
                    </div>
                );
            case TicketType.Task:
                const task = ticket as TaskTicket;
                return (
                     <div className="space-y-4">
                        {task.description && <Section title="Description"><p>{task.description}</p></Section>}
                        {task.subtasks?.length > 0 && (
                            <Section title="Sub-tasks">
                                <ul className="list-disc list-inside space-y-1 text-gray-300">{task.subtasks.map((st, i) => <li key={i}>{st}</li>)}</ul>
                            </Section>
                        )}
                    </div>
                );
            case TicketType.Epic:
                const epic = ticket as EpicTicket;
                return (
                     <div className="space-y-4">
                        {epic.description && <Section title="Description"><p>{epic.description}</p></Section>}
                        {epic.stories?.length > 0 && (
                            <Section title="Potential Stories">
                                 <ul className="list-disc list-inside space-y-1 text-gray-300">{epic.stories.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </Section>
                        )}
                    </div>
                );
            default:
                return <p>Unsupported ticket type.</p>;
        }
    };

    if (isRefining) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg animate-fade-in">
            <div className={`p-6 border-l-4 ${color} rounded-l-xl`}>
                <header className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <Icon />
                        <div>
                            <span className="text-xs font-semibold uppercase text-gray-400">{name}</span>
                            <h3 className="text-xl font-bold text-gray-100">{ticket.title}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            aria-label={copied ? 'Copied to clipboard' : 'Copy ticket content to clipboard'}
                        >
                            {copied ? <CheckIcon /> : <ClipboardIcon />}
                            {copied ? 'Copied!' : 'Copy Text'}
                        </button>
                        <ExportMenu ticket={ticket} type={type} />
                    </div>
                </header>
                <div className="border-t border-gray-700 my-4"></div>
                <div className="space-y-6">
                    {renderTicketContent()}
                </div>
            </div>

            <div className="border-t border-gray-700"></div>

            <div className="p-6 space-y-4">
                <h4 className="text-md font-semibold text-gray-300 flex items-center gap-2">
                    3. Refine this ticket (Optional)
                    {isRefining && (
                        <span className="ml-2 animate-spin inline-block w-4 h-4 border-2 border-t-blue-500 border-gray-400 rounded-full"></span>
                    )}
                </h4>
                <form onSubmit={handleRefineSubmit}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={refineInstruction}
                            onChange={(e) => setRefineInstruction(e.target.value)}
                            placeholder="e.g., 'Make the title shorter' or 'Add a subtask for testing'"
                            className="flex-grow p-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 disabled:opacity-50 shadow-sm focus:shadow-lg"
                            disabled={isRefining}
                        />
                        <button
                            type="submit"
                            disabled={isRefining || !refineInstruction.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:shadow-teal-500/20 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transform hover:scale-105 disabled:scale-100"
                        >
                            {isRefining ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-t-white border-white/40 rounded-full"></span>
                                    Refining...
                                </span>
                            ) : 'Refine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketOutput;
