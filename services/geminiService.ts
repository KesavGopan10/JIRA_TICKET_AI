import { GoogleGenAI, Chat, Part } from "@google/genai";
import { getPrompt } from '../constants';
import { TicketType, GeneratedTicket, HistoryItem } from '../types';

function getUserApiKey(): string {
    return typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : '';
}

function getAIInstance(): GoogleGenAI {
    const apiKey = getUserApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key not set. Please add it in settings.");
    }
    return new GoogleGenAI({ apiKey });
}

// We will manage one chat session at a time.
let chat: Chat | null = null;

export const parseGeneratedTicket = (rawText: string): GeneratedTicket => {
    try {
        let jsonStr = rawText.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);

        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr);
        // A simple validation to see if it has a title.
        if (typeof parsedData.title !== 'string') {
            throw new Error("Invalid ticket format: missing title.");
        }
        return parsedData as GeneratedTicket;

    } catch (error) {
        console.error("Failed to parse JSON response:", error);
        throw new Error("The AI returned a response in an unexpected format. Please try again.");
    }
};

export async function* startNewTicketGenerationStream(
    requirement: string,
    ticketType: TicketType,
    imageBase64: string | null = null,
    imageMimeType: string | null = null
): AsyncGenerator<string> {
    try {
        const prompt = getPrompt(requirement, ticketType);
        const ai = getAIInstance();
        chat = ai.chats.create({
            model: "gemini-2.5-flash-preview-04-17",
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });

        const parts: (string | Part)[] = [{ text: prompt }];

        if (ticketType === TicketType.Bug && imageBase64 && imageMimeType) {
            const base64Data = imageBase64.split(',')[1] || '';
            const mimeType = imageMimeType || 'application/octet-stream'; // Provide a default MIME type if needed
            if (base64Data) {
                parts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data,
                    },
                });
            }
        }

        const response = await chat.sendMessageStream({ message: parts });
        for await (const chunk of response) {
            yield chunk.text ?? '';
        }
    } catch (error) {
        console.error("Error generating ticket with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate ticket: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the ticket.");
    }
}

export async function* refineGeneratedTicketStream(
    refinementInstruction: string
): AsyncGenerator<string> {
    if (!chat) {
        throw new Error("A ticket must be generated before it can be refined.");
    }

    try {
        const refinePrompt = `Based on our conversation, please refine the last generated Jira ticket using the following instruction: "${refinementInstruction}".

IMPORTANT: Your response must be only the complete, updated JSON object for the ticket. Do not include any other text, explanations, or markdown formatting. Just the raw JSON.`;

        const response = await chat.sendMessageStream({ message: refinePrompt });
        for await (const chunk of response) {
            yield chunk.text ?? '';
        }

    } catch (error) {
        console.error("Error refining ticket with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to refine ticket: ${error.message}`);
        }
        throw new Error("An unknown error occurred while refining the ticket.");
    }
}

export const loadChatFromHistory = (item: HistoryItem) => {
    const initialPrompt = getPrompt(item.requirement, item.ticketType);
    const initialResponse = JSON.stringify(item.ticket, null, 2);

    const userParts: Part[] = [{ text: initialPrompt }];
    if (item.ticketType === TicketType.Bug && item.imageBase64 && item.imageMimeType) {
        const base64Data = item.imageBase64.split(',')[1] || '';
        const mimeType = item.imageMimeType || 'application/octet-stream'; // Provide a default MIME type if needed
        if (base64Data) {
            userParts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            });
        }
    }

    const ai = getAIInstance();
    chat = ai.chats.create({
        model: "gemini-2.5-flash-preview-04-17",
        history: [
            { role: 'user', parts: userParts },
            { role: 'model', parts: [{ text: initialResponse }] }
        ],
        config: {
            responseMimeType: "application/json",
            temperature: 0.2,
        },
    });
};
