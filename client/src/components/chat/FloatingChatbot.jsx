import React, { useState, useRef, useEffect } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { sendAIChatMessage } from '../../services/aiService';
import { Bot, Sparkles, X, Send, User, Trash2, Wrench } from 'lucide-react';
import Spinner from '../Spinner';

const SUGGESTED_QUESTIONS = [
  'Where did I spend the most?',
  'Why is my spending higher?',
  'How can I save ₹2,000 this month?',
  'Should I buy a ₹1,500 shirt?',
  'What are my top categories?',
];

const FloatingChatbot = () => {
  const { transactions } = useTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hi there! I am your SpendWise AI assistant. Ask me about your spending, budget advice, or whether to buy something.',
      toolsUsed: ['get_spending_summary'],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await sendAIChatMessage(textToSend, transactions);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        toolsUsed: response.toolsUsed || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I ran into an issue retrieving your spending data. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat cleared. How can I help you with your expenses today?',
        toolsUsed: ['get_spending_summary'],
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-modal focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
          title="Open AI Spending Assistant"
          aria-label="Open AI Spending Assistant"
        >
          <Bot className="w-5 h-5 text-white" />
          <span className="text-xs font-bold hidden sm:inline-block">AI Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300" />
        </button>
      )}

      {/* Floating Chatbot Dialog Panel */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-32px)] sm:w-96 h-[500px] sm:h-[540px] max-h-[calc(100vh-32px)] bg-white border border-slate-200 rounded-card shadow-modal flex flex-col overflow-hidden"
          role="dialog"
          aria-label="AI Spending Assistant Chatbot"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold leading-tight truncate">SpendWise AI Assistant</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Live & MCP Tools Connected</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                title="Clear Conversation"
                aria-label="Clear Conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                title="Close Chatbot"
                aria-label="Close Chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto whitespace-nowrap flex items-center gap-1.5 scrollbar-none">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="inline-block text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-grow p-3.5 overflow-y-auto space-y-3 bg-slate-50/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-2.5 rounded-lg leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line text-[11px] sm:text-xs">{msg.text}</div>

                  {/* MCP Tool Tag */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center gap-1 text-[9px] text-slate-400">
                      <Wrench className="w-2.5 h-2.5" />
                      <span>Tools: {msg.toolsUsed.join(', ')}</span>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded-lg text-xs">
                  <Spinner size="sm" text="Analyzing with MCP tools..." />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about spending or advice..."
              className="app-input py-1.5 px-3 text-xs flex-grow"
              disabled={loading}
            />
            <button
              type="submit"
              className="app-btn-primary p-2 text-xs"
              disabled={loading || !inputValue.trim()}
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
