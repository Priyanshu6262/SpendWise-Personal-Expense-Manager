import React, { useState } from 'react';
import { Send, Bot, User, Wrench } from 'lucide-react';
import { sendAIChatMessage } from '../../services/aiService';
import Spinner from '../Spinner';

const SUGGESTED_PROMPTS = [
  'Where did I spend the most this month?',
  'Why is my spending higher this period?',
  'What are my biggest unnecessary expenses?',
  'How can I save ₹3,000 this month?',
  'Should I buy a ₹2,500 jacket?',
];

const AIAssistantChat = ({ allTransactions = [] }) => {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Hello! I am your SpendWise AI Finance Assistant. Ask me anything about your spending trends, category drivers, potential savings, or whether you should make a specific purchase.',
      toolsUsed: ['get_spending_summary'],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await sendAIChatMessage(textToSend, allTransactions);
      const assistantMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        toolsUsed: response.toolsUsed || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an issue analyzing your transactions. Please try rephrasing your question.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Suggested Prompt Chips */}
      <div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Suggested Questions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200/60 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="border border-slate-200 rounded-lg bg-slate-50/50 p-4 min-h-[260px] max-h-[380px] overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-lg text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* MCP Tool Usage Tag */}
              {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400">
                  <Wrench className="w-3 h-3" />
                  <span>Context tools: {msg.toolsUsed.join(', ')}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
              <Spinner size="sm" text="Thinking & executing MCP tools..." />
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about your spending..."
          className="app-input text-xs"
          disabled={loading}
        />
        <button
          type="submit"
          className="app-btn-primary px-4"
          disabled={loading || !inputValue.trim()}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistantChat;
