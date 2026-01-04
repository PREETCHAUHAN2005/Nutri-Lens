import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../../redux/slices/chatSlice';
import { Send, Loader, Sparkles } from 'lucide-react';

const ChatInterface = ({ conversationId }) => {
  const dispatch = useDispatch();
  const { messages, sending } = useSelector((state) => state.chat);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input;
    setInput('');
    await dispatch(sendMessage({ conversationId, message: msg }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-60">
            <Sparkles className="w-12 h-12 mx-auto text-primary-400 mb-3" />
            <p className="text-gray-500">Ask me anything about the ingredients!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-primary-600 text-white rounded-br-none' 
                : 'bg-white border border-gray-200 rounded-bl-none text-gray-800 shadow-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              
              {/* AI Reasoning in Chat */}
              {msg.reasoning?.visible && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold opacity-70 mb-1">AI Reasoning:</p>
                  <ul className="text-xs opacity-70 list-disc pl-4">
                    {msg.reasoning.steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="e.g., Is this safe for diabetics?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? <Loader className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;