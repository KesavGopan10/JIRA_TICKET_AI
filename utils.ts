import { GeneratedTicket, TicketType, BugTicket, StoryTicket, EpicTicket, TaskTicket } from './types';

export const formatTicketAsMarkdown = (ticket: GeneratedTicket, type: TicketType): string => {
    let content = `**Title:** ${ticket.title}\n\n`;
    
    if ('priority' in ticket && ticket.priority) {
        content += `**Priority:** ${ticket.priority}\n\n`;
    }

    if (ticket.description) {
        content += `**Description:**\n${ticket.description}\n\n`;
    }


    if (type === TicketType.Bug) {
        const bug = ticket as BugTicket;
        if (bug.stepsToReproduce?.length) {
            content += `**Steps to Reproduce:**\n${bug.stepsToReproduce.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n`;
        }
        if (bug.expectedBehavior) {
            content += `**Expected Behavior:**\n${bug.expectedBehavior}\n\n`;
        }
        if (bug.actualBehavior) {
            content += `**Actual Behavior:**\n${bug.actualBehavior}\n\n`;
        }
    } else if (type === TicketType.Story) {
        const story = ticket as StoryTicket;
        if (story.acceptanceCriteria?.length) {
            content += `**Acceptance Criteria:**\n${story.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}\n\n`;
        }
    } else if (type === TicketType.Task) {
        const task = ticket as TaskTicket;
        if (task.subtasks?.length) {
            content += `**Sub-tasks:**\n${task.subtasks.map(st => `- ${st}`).join('\n')}\n\n`;
        }
    } else if (type === TicketType.Epic) {
        const epic = ticket as EpicTicket;
        if (epic.stories?.length) {
            content += `**Potential Stories:**\n${epic.stories.map(s => `- ${s}`).join('\n')}\n\n`;
        }
    }

    return content;
};
