'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  error?: boolean;
}

type AgentType = 'chat' | 'router' | 'accountant' | 'browser' | 'gen-computer' | 'mathematician' | 'child-agent';

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `/api/${selectedAgent}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Handle different response formats
      const responseContent = data.data?.response || data.data?.result || data.data || 'No response received';
      const modelName = data.agent || data.data?.model || data.data?.agent || selectedAgent;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        model: modelName,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err instanceof Error ? err.message : 'An unexpected error occurred',
        timestamp: new Date(),
        error: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Larissa AI</h1>
                <p className="text-xs text-gray-500">Multi-Agent Intelligence Platform</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Chat
              </button>
            )}
          </div>
          
          {/* Agent Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'chat', name: 'Chat', icon: '💬' },
              { id: 'router', name: 'Router', icon: '🔀' },
              { id: 'accountant', name: 'Accountant', icon: '💼' },
              { id: 'browser', name: 'Browser', icon: '🔍' },
              { id: 'gen-computer', name: 'Gen Computer', icon: '💻' },
              { id: 'mathematician', name: 'Mathematician', icon: '📐' },
              { id: 'child-agent', name: 'Child Agent', icon: '🤖' },
            ].map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id as AgentType)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  selectedAgent === agent.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{agent.icon}</span>
                {agent.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome to Larissa AI
              </h2>
              <p className="text-gray-600 max-w-md">
                Select an AI agent above and start a conversation. Your messages will be
                routed to specialized models for optimal responses.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">💬 General Chat</h3>
                  <p className="text-sm text-gray-600">
                    Conversational AI with intelligent routing
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">💼 Accountant</h3>
                  <p className="text-sm text-gray-600">
                    Finance, tax, and accounting expertise
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">🔍 Web Search</h3>
                  <p className="text-sm text-gray-600">
                    Real-time information retrieval
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">💻 Gen Computer</h3>
                  <p className="text-sm text-gray-600">
                    Code generation and computational tasks
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">📐 Mathematician</h3>
                  <p className="text-sm text-gray-600">
                    Complex math and problem-solving
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">🤖 Child Agent</h3>
                  <p className="text-sm text-gray-600">
                    Auto-routes to best specialized agent
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm">Larissa is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Error Banner */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 pb-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
