import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import Button from './Button';
import { cn } from '../../utils/cn';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to Equity Citadel Intelligence. I am your institutional trading co-pilot. How can I assist your market analysis today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock AI Response
    setTimeout(() => {
      const aiMsg = { 
        role: 'assistant', 
        content: `Analyzing ${input}... Based on current market liquidity and sentiment, I recommend monitoring the 2450.00 support level. RSI indicates a potential oversold condition.` 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-80 h-[450px] flex flex-col p-0 glass-panel shadow-2xl border-pink-200/20 overflow-hidden">
              <div className="bg-primary/20 p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-primary-fixed">Equity Citadel AI</h3>
                  <span className="text-[10px] text-zinc-500 uppercase">Institutional Assistant</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed",
                      msg.role === 'user' ? "bg-white/10 text-zinc-200 rounded-tr-none" : "bg-primary/10 text-primary-fixed rounded-tl-none border border-primary/20"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10 bg-zinc-950/50">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-primary/50 text-zinc-200" 
                    placeholder="Ask about ETH/USDT..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button onClick={handleSend} className="bg-primary p-2 rounded-xl text-white hover:bg-primary/80 transition-colors">
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110",
          isOpen ? "bg-zinc-800 text-zinc-400 rotate-90" : "bg-primary text-white shadow-primary/40"
        )}
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'auto_awesome'}
        </span>
      </button>
    </div>
  );
};

export default AIAssistant;
