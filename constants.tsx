import { TicketType } from './types';

export const TICKET_TYPES = [
    TicketType.Bug,
    TicketType.Story,
    TicketType.Task,
    TicketType.Epic
];

export const getPrompt = (requirement: string, ticketType: TicketType): string => {
    const basePrompt = `You are an expert Jira project manager. Your task is to analyze the following user requirement and generate a well-structured Jira ticket of type "${ticketType}".

User Requirement: "${requirement}"

Your response MUST be a single, valid JSON object, without any surrounding text, explanations, or markdown fences. The JSON structure must conform to the specified format for the ticket type.`;

    switch (ticketType) {
        case TicketType.Bug:
            return `${basePrompt}

If an image is provided by the user, analyze it for additional visual context about the bug (e.g., UI layout issues, error messages shown in the screenshot, etc.).

JSON format for a Bug:
{
  "title": "A concise and descriptive title for the bug",
  "description": "A detailed summary of the issue.",
  "stepsToReproduce": ["A clear, ordered list of steps to trigger the bug"],
  "expectedBehavior": "What should have happened?",
  "actualBehavior": "What actually happened?",
  "priority": "High | Medium | Low"
}`;
        case TicketType.Story:
            return `${basePrompt}

JSON format for a Story:
{
  "title": "A short, user-centric title for the story",
  "description": "The user story in the format: 'As a [user type], I want [some goal] so that [some reason].'",
  "acceptanceCriteria": ["A list of specific, testable criteria that must be met for the story to be considered complete."]
}`;
        case TicketType.Task:
            return `${basePrompt}

JSON format for a Task:
{
  "title": "A clear, action-oriented title for the task",
  "description": "A detailed description of the work to be done.",
  "subtasks": ["A list of smaller, concrete sub-items needed to complete the main task."]
}`;
        case TicketType.Epic:
            return `${basePrompt}

JSON format for an Epic:
{
  "title": "A high-level title for the large body of work",
  "description": "A comprehensive overview of the epic, its goals, and its business value.",
  "stories": ["A list of potential user story titles that could belong to this epic."]
}`;
        default:
            return requirement;
    }
};