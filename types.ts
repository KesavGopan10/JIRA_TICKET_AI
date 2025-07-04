export enum TicketType {
  Bug = 'Bug',
  Story = 'Story',
  Epic = 'Epic',
  Task = 'Task',
}

export interface BugTicket {
  title: string;
  description: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StoryTicket {
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface EpicTicket {
  title: string;
  description: string;
  stories: string[];
}

export interface TaskTicket {
  title: string;
  description: string;
  subtasks: string[];
}

export type GeneratedTicket = BugTicket | StoryTicket | EpicTicket | TaskTicket;

export interface HistoryItem {
  id: string;
  requirement: string;
  ticketType: TicketType;
  ticket: GeneratedTicket;
  timestamp: number;
  imageBase64?: string | null;
  imageMimeType?: string | null;
}