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
import { Analytics } from '@vercel/analytics/react';

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

  // Load history from localStorage on initial render
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('jiraTicketHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
      return [];
    }
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const apiKeyPresent = !!apiKey;

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('jiraTicketHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
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
      setError('Please enter a requirement');
      setErrorType('invalid');
      return;
    }
    setIsLoading(true);
    clearOutputState();
    setError(null);
    setCurrentHistoryId(null);
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
        ticket,
        ticketType,
        timestamp: Date.now(),
        imageBase64,
        imageMimeType
      };

      setHistory(prev => {
        const updatedHistory = [newItem, ...prev.filter(h => h.id !== newItem.id)].sort((a, b) => b.timestamp - a.timestamp);
        return updatedHistory.slice(0, 50);
      });

      setCurrentHistoryId(newItem.id);
    } catch (err) {
      setError(getErrorMessage(err));
      setErrorType('api');
    } finally {
      setIsLoading(false);
    }
  }, [requirement, ticketType, imageBase64, imageMimeType]);

  const handleRefineTicket = useCallback(async (instruction: string) => {
    if (!instruction.trim()) return;
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
        setHistory(prev => {
          const updated = prev.map(item =>
            item.id === currentHistoryId
              ? { ...item, ticket: refinedTicket, timestamp: Date.now() }
              : item
          );
          return updated.sort((a, b) => b.timestamp - a.timestamp);
        });
      } else {
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          requirement,
          ticket: refinedTicket,
          ticketType,
          timestamp: Date.now(),
          imageBase64,
          imageMimeType
        };
        setCurrentHistoryId(newItem.id);
        setHistory(prev => {
          const updated = [newItem, ...prev];
          return updated.slice(0, 50);
        });
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
    // Do NOT update the ticket type here
    setCurrentHistoryId(item.id);
    setImageBase64(item.imageBase64 ?? null);
    setImageMimeType(item.imageMimeType ?? null);
    setError(null);
    setStreamingOutput('');
    
    // Set the generated ticket after a small delay to ensure the ticket type is updated first
    setTimeout(() => {
      setGeneratedTicket(item.ticket);
      // Load chat history after the UI has updated
      loadChatFromHistory(item);
    }, 0);
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

  const handleClearForm = useCallback((clearRequirement = true) => {
    if (clearRequirement) {
      setRequirement('');
    }
    setGeneratedTicket(null);
    setError(null);
    setCurrentHistoryId(null);
    setStreamingOutput('');
    setImageBase64(null);
    setImageMimeType(null);
  }, []);

  const handleTicketTypeChange = useCallback((newType: TicketType) => {
    handleClearForm(false);
    setTicketType(newType);
  }, [handleClearForm]);

  const handleCopyToast = () => toast.success('Copied to clipboard!');

  const isBusy = isLoading || isRefining;
  const isStreaming = isBusy && streamingOutput;

  return (
    <>
      <AnimatedBackground />
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-900 to-[#0a0e2a] text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <main className="container mx-auto px-2 py-4 md:py-4 lg:py-4">
          <header className="mb-8 text-center relative">
            <div className="flex justify-center items-center gap-2">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                 <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#6a11cb] to-[#2575fc]">
                  Jira Ticket AI
                </h1>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-full bg-[#1a1e3a] hover:bg-[#2a2e4a] shadow-lg transition-all duration-200"
                aria-label="Settings"
              >
                <SettingsIcon className="w-5 h-5 text-[#2575fc]" />
              </motion.button>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-md text-gray-300 max-w-2xl mx-auto"
            >
              Describe your requirement, and let our AI craft the perfect Jira ticket. <span className="text-[#2575fc]">Efficient. Precise. Professional.</span>
            </motion.p>
            {!apiKeyPresent && (
              <div className="mt-6 mx-auto w-full max-w-xl p-6 border border-[#2a2e4a] bg-[#1a1e3a] rounded-xl shadow-lg">
                <p className="text-lg font-semibold text-white mb-2">Add your Gemini API Key</p>
                <p className="text-gray-300 text-sm mb-4">
                  You need a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-[#2575fc]">Google Gemini API key</a> to use this app.
                </p>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc] text-white py-2 px-5 rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Open Settings
                </button>
              </div>
            )}
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-8 space-y-6">
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#1a1e3a] p-6 rounded-2xl shadow-xl border border-[#2a2e4a] hover:border-[#2575fc] transition-all duration-300"
              >
                <div className="space-y-6">
                  <RequirementInput value={requirement} onChange={setRequirement} onClear={handleClearForm} disabled={isBusy} />
                  <div className="space-y-6 pt-2">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ticket Type
                      </label>
                      <TicketTypeSelector selectedType={ticketType} onSelectType={handleTicketTypeChange} disabled={isBusy} />
                    </div>
                    {ticketType === TicketType.Bug && (
                      <ImageUploader
                        imageBase64={imageBase64}
                        onImageSelect={setImageBase64}
                        onImageRemove={handleImageRemove}
                        disabled={isBusy}
                      />
                    )}
                  </div>
                  <motion.div
                    className="pt-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <button
                      onClick={handleGenerateTicket}
                      disabled={isBusy || !requirement.trim()}
                      className={`w-full px-6 py-3.5 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 ease-out ${
                        !isBusy && requirement.trim()
                          ? 'bg-gradient-to-r from-[#6a11cb] to-[#2575fc] text-white hover:from-[#6a11cb] hover:to-[#2575fc] transform hover:-translate-y-0.5 hover:shadow-[#2575fc]/30'
                          : 'bg-[#2a2e4a] text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin"></span>
                          Generating Ticket...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="text-xl">✨</span>
                          Generate Ticket
                        </span>
                      )}
                    </button>
                  </motion.div>
                </div>
              </motion.section>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ErrorCard message={error} onClose={() => setError(null)} type={errorType} />
                </motion.div>
              )}
              {isBusy && !isStreaming && <Loader />}
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <StreamingOutput text={streamingOutput} />
                </motion.div>
              )}
              {!isBusy && generatedTicket && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TicketOutput
                    ticket={generatedTicket}
                    type={currentHistoryId ? (history.find(h => h.id === currentHistoryId)?.ticketType ?? ticketType) : ticketType}
                    imageBase64={imageBase64}
                    onRefine={handleRefineTicket}
                    isRefining={isRefining}
                    onCopyToast={handleCopyToast}
                  />
                </motion.div>
              )}
            </div>
            <div className="lg:col-span-4">
              <HistoryPanel
                history={history}
                onLoad={handleLoadFromHistory}
                activeId={currentHistoryId}
                disabled={isBusy}
              />
            </div>
          </div>
        </main>
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onApiKeyChange={setApiKey} />
      </motion.div>
      <Analytics />
    </>
  );
};

export default App;
