import React from 'react';
import { Sparkles } from 'lucide-react';

const QuickActions = ({ onSelect }) => {
  const suggestions = [
    "Is this safe for daily consumption?",
    "What are the main health concerns?",
    "Are there any hidden sugars?",
    "Can you suggest healthier alternatives?",
    "What does the 3rd ingredient do?",
  ];

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <Sparkles size={14} className="text-primary-500" />
        Suggested Questions
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((text, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(text)}
            className="px-3 py-1.5 bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-full text-xs transition-colors"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;