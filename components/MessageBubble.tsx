'use client';

import { Message } from './ChatUI';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.error || false;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`flex max-w-[80%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        } items-end space-x-2`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-primary-600 ml-2'
              : isError
              ? 'bg-red-500'
              : 'bg-gray-700 mr-2'
          }`}
        >
          {isUser ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ) : isError ? (
            <svg
              className="w-5 h-5 text-white"
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
          ) : (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-primary-600 text-white rounded-tr-sm'
                : isError
                ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-sm'
                : 'bg-white text-gray-900 shadow-md border border-gray-200 rounded-tl-sm'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Metadata */}
          <div
            className={`flex items-center space-x-2 mt-1 px-2 text-xs text-gray-500 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <span>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.model && !isUser && (
              <>
                <span>•</span>
                <span className="font-medium text-primary-600">{message.model}</span>
              </>
            )}
            {isError && (
              <>
                <span>•</span>
                <span className="text-red-600 font-medium">Failed</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
