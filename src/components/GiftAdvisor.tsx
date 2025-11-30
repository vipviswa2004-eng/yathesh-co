import React, { useState, useRef, useEffect } from 'react';
import { Gift, Send, X, Loader2, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context';

const DEFAULT_OPTIONS = [
  "Birthday Gift 🎂",
  "Anniversary Ideas ❤️",
  "Something for Him 👨",
  "Something for Her 👩"
];

export const GiftAdvisor: React.FC = () => {
  const navigate = useNavigate();
  const { isGiftAdvisorOpen, setIsGiftAdvisorOpen } = useCart();
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "Hi! I'm your Gift Genie 🧞‍♂️. Not sure what to get? Let's find the perfect gift together! Who are you shopping for today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>(DEFAULT_OPTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isGiftAdvisorOpen]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, text: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setCurrentOptions([]); 

    // Placeholder response - will be integrated with Lovable AI
    setTimeout(() => {
      const botResponse = "Thanks for sharing! I'm working on integrating AI recommendations. In the meantime, check out our popular gifts in the shop!";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      setCurrentOptions(["Browse 3D Crystals", "See Wood Art", "View All Gifts"]);
      setLoading(false);
    }, 1000);
  };

  const handleRestart = () => {
    setMessages([{ role: 'bot', text: "Hi! I'm your Gift Genie 🧞‍♂️. Not sure what to get? Let's find the perfect gift together! Who are you shopping for today?" }]);
    setCurrentOptions(DEFAULT_OPTIONS);
  };

  const renderMessageContent = (text: string) => {
    return <span>{text}</span>;
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col items-end font-sans">
      {isGiftAdvisorOpen && (
        <div className="bg-white w-72 h-96 rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden mb-3 animate-scale-up origin-bottom-right ring-1 ring-black/5">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-purple-900 text-white p-3 flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm shadow-inner">
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide text-white">Gift Genie</h3>
                <p className="text-[10px] text-purple-200 font-medium">AI Personal Shopper</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleRestart} title="Restart" aria-label="Restart conversation" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => setIsGiftAdvisorOpen(false)} title="Close Gift Advisor" aria-label="Close Gift Advisor" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Chat Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 custom-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white text-[10px] mr-2 shrink-0 shadow-sm mt-1">
                    🧞‍♂️
                  </div>
                )}
                <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] shadow-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-br-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}>
                  {renderMessageContent(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">🧞‍♂️</div>
                <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5 text-[10px] text-gray-500 shadow-sm">
                  <Loader2 className="animate-spin h-2.5 w-2.5 text-primary" /> Finding ideas...
                </div>
              </div>
            )}
            
            {currentOptions.length > 0 && !loading && (
              <div className="flex flex-col gap-1.5 mt-2">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(opt)}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 text-gray-800 text-[11px] font-medium py-2 px-3 rounded-lg border border-purple-200 hover:border-primary hover:shadow-md transition-all text-left flex items-center justify-between group"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-gray-100 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary text-white p-2 rounded-lg hover:bg-purple-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsGiftAdvisorOpen(!isGiftAdvisorOpen)}
        className="bg-gradient-to-r from-primary to-purple-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 ring-4 ring-white"
        title="Open Gift Advisor"
        aria-label="Open Gift Advisor"
      >
        {isGiftAdvisorOpen ? <X className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
      </button>
    </div>
  );
};
