import React from 'react';
import { ArrowRight } from 'lucide-react';

const ReasoningChain = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={index} className="relative pl-8 pb-6 last:pb-0">
          {/* Connector Line */}
          {index !== steps.length - 1 && (
            <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gray-200"></div>
          )}
          
          {/* Step Number Bubble */}
          <div className="absolute left-0 top-0 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-sm">
            {index + 1}
          </div>

          {/* Content Card */}
          <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">{step.thought}</h4>
            
            {/* Evidence List */}
            {step.evidence && step.evidence.length > 0 && (
              <ul className="mb-3 space-y-1">
                {step.evidence.map((ev, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                    <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    {ev}
                  </li>
                ))}
              </ul>
            )}

            {/* Conclusion */}
            <div className="flex items-start gap-2 bg-gray-50 p-2 rounded text-xs text-gray-700 font-medium border border-gray-100">
              <ArrowRight size={14} className="mt-0.5 text-primary-500 shrink-0" />
              {step.conclusion}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReasoningChain;