import React from 'react';
import { Brain, CheckCircle, AlertTriangle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const AnalysisView = ({ analysis, onStartChat }) => {
  const [showReasoning, setShowReasoning] = React.useState(false);

  if (!analysis) return null;

  const { insights, inferredIntent } = analysis;
  const { summary, healthImpact, reasoningSteps, personalizedAdvice } = insights;

  // Helper for color coding verdicts
  const getVerdictColor = (v) => {
    switch(v) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'concerning': 
      case 'avoid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 pb-24 animate-fade-in">
      
      {/* 1. Verdict Header */}
      <div className={`p-6 rounded-2xl border ${getVerdictColor(summary.verdict)} text-center`}>
        <div className="text-4xl mb-2">{summary.score}</div>
        <h2 className="text-xl font-bold capitalize mb-1">{summary.verdict} Choice</h2>
        <p className="opacity-90">{summary.oneLineSummary}</p>
      </div>

      {/* 2. Intent Inference (The "Magic" Moment) */}
      {inferredIntent && (
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3 items-start">
          <Brain className="w-5 h-5 text-purple-600 shrink-0 mt-1" />
          <div>
            <p className="text-sm font-semibold text-purple-900">
              I noticed you're interested in {inferredIntent.primaryGoal}.
            </p>
            <p className="text-xs text-purple-700 mt-1">
              {inferredIntent.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* 3. Positives & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthImpact.positives.length > 0 && (
          <div className="bg-green-50 p-5 rounded-xl border border-green-100">
            <h3 className="font-semibold text-green-900 flex items-center gap-2 mb-3">
              <CheckCircle size={18} /> Good Stuff
            </h3>
            <ul className="space-y-2">
              {healthImpact.positives.map((item, i) => (
                <li key={i} className="text-sm text-green-800">• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {healthImpact.concerns.length > 0 && (
          <div className="bg-red-50 p-5 rounded-xl border border-red-100">
            <h3 className="font-semibold text-red-900 flex items-center gap-2 mb-3">
              <AlertTriangle size={18} /> Watch Out
            </h3>
            <ul className="space-y-2">
              {healthImpact.concerns.map((item, i) => (
                <li key={i} className="text-sm text-red-800">• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4. Personalized Advice */}
      {personalizedAdvice.relevant && (
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">Personalized Note</h3>
          <p className="text-sm text-blue-800 mb-2">{personalizedAdvice.whyRelevant}</p>
          {personalizedAdvice.alternatives.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">Better Alternatives:</p>
              <p className="text-sm text-blue-800">{personalizedAdvice.alternatives.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {/* 5. Reasoning Chain (Collapsible) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button 
          onClick={() => setShowReasoning(!showReasoning)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">View AI Reasoning Chain</span>
          {showReasoning ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {showReasoning && (
          <div className="p-4 bg-white space-y-4">
            {reasoningSteps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.thought}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.conclusion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for Chat */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center">
        <button
          onClick={onStartChat}
          className="bg-primary-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-primary-900/20 flex items-center gap-2 hover:bg-primary-700 transition-transform active:scale-95"
        >
          <MessageCircle size={20} />
          Ask AI Copilot
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;