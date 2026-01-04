import React, { useState } from 'react';
import { User, Brain, ChevronDown, ChevronUp } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-gray-200' : 'bg-gradient-to-br from-primary-500 to-indigo-600'
      }`}>
        {isUser ? <User size={14} className="text-gray-600" /> : <Brain size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${
        isUser 
          ? 'bg-primary-600 text-white rounded-tr-none' 
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
      }`}>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

        {/* AI Reasoning Toggle (Only for assistant) */}
        {!isUser && message.reasoning && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:underline"
            >
              <Brain size={12} />
              {showReasoning ? 'Hide' : 'Show'} Thinking Process
              {showReasoning ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showReasoning && (
              <div className="mt-2 bg-gray-50 rounded p-2.5 text-xs text-gray-600 border border-gray-100">
                <p className="font-semibold mb-1 text-gray-900">Logic Chain:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  {message.reasoning.steps?.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
                {message.reasoning.confidence && (
                  <div className="mt-2 text-right text-primary-600 font-bold">
                    Confidence: {(message.reasoning.confidence * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;