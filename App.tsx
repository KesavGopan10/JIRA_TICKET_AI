import React, { useState, useCallback, useEffect } from 'react';
import {
  TicketType,
  GeneratedTicket,
  HistoryItem
} from './types';
import {
  startNewTicketGenerationStream,
  refineGeneratedTicketStream,
  loadChatFromHistory,
  parseGeneratedTicket
} from './services/geminiService';
import RequirementInput from './components/RequirementInput';
import TicketTypeSelector from './components/TicketTypeSelector';
import TicketOutput from './components/TicketOutput';
import Loader from './components/Loader';
import HistoryPanel from './components/HistoryPanel';
import StreamingOutput from './components/StreamingOutput';
import ImageUploader from './components/ImageUploader';
import SettingsModal from './components/SettingsModal';
import ErrorCard from './components/ErrorCard';
import AnimatedBackground from './components/AnimatedBackground';
import SettingsIcon from './components/icons/SettingsIcon';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const getStoredApiKey = () => localStorage.getItem('geminiApiKey') || '';

const App: React.FC = () => {
  const [requirement, setRequirement] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>(TicketType.Story);
  const [generatedTicket, setGeneratedTicket] = useState<GeneratedTicket | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'api' | 'invalid' | 'default'>('default');

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const apiKeyPresent = !!apiKey;

  useEffect(() => {
    const stored = localStorage.getItem('jiraTicketHistory');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        console.warn('History parse failed.');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jiraTicketHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (ticketType !== TicketType.Bug && imageBase64) handleImageRemove();
  }, [ticketType]);

  useEffect(() => setApiKey(getStoredApiKey()), []);

  const clearOutputState = () => {
    setGeneratedTicket(null);
    setCurrentHistoryId(null);
    setStreamingOutput('');
  };

  const handleGenerateTicket = useCallback(async () => {
    if (!requirement.trim()) {
      setError('Please enter a requirement.');
      setErrorType('invalid');
      return;
    }

    setIsLoading(true);
    clearOutputState();
    setError(null);
    let fullResponse = '';

    try {
      const stream = startNewTicketGenerationStream(requirement, ticketType, imageBase64, imageMimeType);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingOutput(fullResponse);
      }
      const ticket = parseGeneratedTicket(fullResponse);
      setGeneratedTicket(ticket);

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        requirement,
        ticketType,
        ticket,
        timestamp: Date.now(),
        imageBase64,
        imageMimeType
      };
      setCurrentHistoryId(newItem.id);
      setHistory(prev => [newItem, ...prev.filter(h => h.id !== newItem.id)].sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      setError(getErrorMessage(err));
      setErrorType('api');
    } finally {
      setIsLoading(false);
    }
  }, [requirement, ticketType, imageBase64, imageMimeType]);

  const handleRefineTicket = useCallback(async (instruction: string) => {
    setIsRefining(true);
    setError(null);
    setStreamingOutput('');
    let fullResponse = '';

    try {
      const stream = refineGeneratedTicketStream(instruction);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingOutput(fullResponse);
      }

      const refinedTicket = parseGeneratedTicket(fullResponse);
      setGeneratedTicket(refinedTicket);
      toast.success('Ticket refined!');

      if (currentHistoryId) {
        setHistory(prev => prev.map(item =>
          item.id === currentHistoryId ? { ...item, ticket: refinedTicket, timestamp: Date.now() } : item
        ));
      } else {
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          requirement: 'Refined ticket',
          ticketType,
          ticket: refinedTicket,
          timestamp: Date.now(),
          imageBase64,
          imageMimeType
        };
        setCurrentHistoryId(newItem.id);
        setHistory(prev => [newItem, ...prev]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setErrorType('api');
      toast.error('Failed to refine ticket.');
    } finally {
      setIsRefining(false);
    }
  }, [currentHistoryId, ticketType, imageBase64, imageMimeType]);

  const handleLoadFromHistory = useCallback((item: HistoryItem) => {
    setRequirement(item.requirement);
    setTicketType(item.ticketType);
    setGeneratedTicket(item.ticket);
    setCurrentHistoryId(item.id);
    setImageBase64(item.imageBase64 ?? null);
    setImageMimeType(item.imageMimeType ?? null);
    setError(null);
    setStreamingOutput('');
    loadChatFromHistory(item);
  }, []);

  const getErrorMessage = (err: unknown): string => {
    try {
      if (typeof err === 'string') return JSON.parse(err)?.error?.message || err;
      if (err instanceof Error) return JSON.parse(err.message)?.error?.message || err.message;
      if (typeof err === 'object' && err !== null && 'message' in err) return (err as any).message;
    } catch {}
    return 'An unexpected error occurred.';
  };

  const handleImageRemove = useCallback(() => {
    setImageBase64(null);
    setImageMimeType(null);
    if (generatedTicket) clearOutputState();
  }, [generatedTicket]);

  const handleClearForm = useCallback(() => {
    setRequirement('');
    setGeneratedTicket(null);
    setError(null);
    setCurrentHistoryId(null);
    setStreamingOutput('');
    setImageBase64(null);
    setImageMimeType(null);
  }, []);

  const handleCopyToast = () => toast.success('Copied to clipboard!');
  const isBusy = isLoading || isRefining;
  const isStreaming = isBusy && streamingOutput;

  return (
    <>
      <AnimatedBackground />
      <motion.div
        className="min-h-screen bg-[#0D1117] text-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <main className="container mx-auto px-4 py-10 md:px-8">
          <header className="mb-12 text-center relative">
            <div className="flex justify-center items-center gap-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#58A6FF] to-[#39D3BB]">
                Jira Ticket Generator AI
              </h1>
              <button
                onClick={() => setSettingsOpen(true)}
                className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                aria-label="Settings"
              >
                <SettingsIcon className="w-6 h-6 text-[#58A6FF]" />
              </button>
            </div>
            <p className="mt-3 text-gray-400">Describe, generate, and refine. AI drafts the ticket — you lead the sprint.</p>

            {!apiKeyPresent && (
              <div className="mt-6 mx-auto w-full max-w-xl p-6 border border-[#30363D] bg-[#1c1f26] rounded-xl shadow-lg">
                <p className="text-lg font-semibold text-white mb-2">Add your Gemini API Key</p>
                <p className="text-gray-400 text-sm mb-4">
                  You need a <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline text-[#58A6FF]">Google Gemini API key</a> to use this app.
                </p>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="bg-gradient-to-r from-[#58A6FF] to-[#39D3BB] text-white py-2 px-5 rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Open Settings →
                </button>
              </div>
            )}
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-[#161b22] p-6 rounded-2xl shadow-lg border border-[#30363D]">
                <RequirementInput value={requirement} onChange={setRequirement} onClear={handleClearForm} disabled={isBusy} />

                <div className="mt-6 space-y-5">
                  <TicketTypeSelector selectedType={ticketType} onSelectType={setTicketType} disabled={isBusy} />
                  {ticketType === TicketType.Bug && (
                    <ImageUploader
                      imageBase64={imageBase64}
                      onImageSelect={setImageBase64}
                      onImageRemove={handleImageRemove}
                      disabled={isBusy}
                    />
                  )}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleGenerateTicket}
                    disabled={isBusy || !requirement.trim()}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#58A6FF] to-[#39D3BB] text-white font-semibold rounded-lg shadow-lg hover:scale-105 active:scale-95 disabled:bg-gray-600 transition-all"
                  >
                    {isLoading ? '✨ Generating...' : '✨ Generate Ticket'}
                  </button>
                </div>
              </section>

              {error && <ErrorCard message={error} onClose={() => setError(null)} type={errorType} />}
              {isBusy && !isStreaming && <Loader />}
              {isStreaming && <StreamingOutput text={streamingOutput} />}
              {!isBusy && generatedTicket && (
                <TicketOutput
                  ticket={generatedTicket}
                  type={ticketType}
                  imageBase64={imageBase64}
                  onRefine={handleRefineTicket}
                  isRefining={isRefining}
                  onCopyToast={handleCopyToast}
                />
              )}
            </div>

            <HistoryPanel
              history={history}
              onLoad={handleLoadFromHistory}
              activeId={currentHistoryId}
              disabled={isBusy}
            />
          </div>
        </main>

        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onApiKeyChange={setApiKey} />
      </motion.div>
    </>
  );
};

export default App;
