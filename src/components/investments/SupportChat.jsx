import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { cn } from '../../utils/cn';

const SUPPORT_KNOWLEDGE = {
  plans: [
    { name: 'Starter Protocol', min: '$1,000', duration: '7 Days', roi: '12%' },
    { name: 'Silver Strategic', min: '$5,000', duration: '14 Days', roi: '25%' },
    { name: 'Gold Institutional', min: '$10,000', duration: '21 Days', roi: '45%' },
    { name: 'Platinum Elite', min: '$15,000', duration: '30 Days', roi: '75%' }
  ],
  deposit: "To deposit, navigate to the 'Vault' or click 'Deposit' in your navigation. Choose your asset (BTC, ETH, etc.), transfer to the provided address, and our protocol will settle the balance automatically.",
  verification: "Tier 4 verification is required for high-volume institutional withdrawals. You can start this in your Settings page."
};

const SupportChat = ({ isOpen, onClose, initialPlan }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = initialPlan 
        ? `Welcome to Protocol Support. I see you're interested in the ${initialPlan.name}. This strategy requires a $${initialPlan.range.toLocaleString()} minimum for a ${initialPlan.roi}% ROI. How can I assist with your allocation?`
        : "Welcome to Equity Citadel Institutional Support. I can assist with Investment Protocols, Deposit Procedures, and Account Verification. How can I help you today?";
      
      setMessages([{ role: 'assistant', content: welcome }]);
    }
  }, [isOpen, initialPlan]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let response = "";
      const t = input.toLowerCase();

      if (t.includes('deposit') || t.includes('pay') || t.includes('fund') || t.includes('how to invest')) {
        response = SUPPORT_KNOWLEDGE.deposit;
      } else if (t.includes('roi') || t.includes('profit') || t.includes('earn')) {
        response = "Our protocols yield between 12% and 75% depending on the horizon. The Platinum Elite strategy offers the maximum efficiency at 75% ROI over 30 days.";
      } else if (t.includes('minimum') || t.includes('much')) {
        response = "Our entry-level Starter Protocol requires $1,000. For full institutional scale, the Platinum Elite requires $15,000.";
      } else if (t.includes('safe') || t.includes('secure')) {
        response = "All capital is protected by our Multi-Sig Multi-Layer Security protocol and secondary liquidity pools. We maintain a 99.9% uptime for all settlement nodes.";
      } else {
        response = "I can guide you through our specific investment tiers or the deposit process. Would you like to know more about the Silver, Gold, or Platinum protocols?";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-background/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg"
          >
            <Card className="h-[600px] flex flex-col p-0 glass-panel shadow-2xl border-primary/20 overflow-hidden relative">
              {/* Header */}
              <div className="bg-primary/10 p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">contact_support</span>
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white">Institutional Support</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                       <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Protocol Intelligence v4.0</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Chat Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed font-medium",
                      msg.role === 'user' 
                        ? "bg-primary text-black rounded-tr-none shadow-lg shadow-primary/10" 
                        : "bg-white/5 text-zinc-300 rounded-tl-none border border-white/5"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/10 bg-zinc-950/40">
                <div className="flex gap-3">
                  <input 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-primary/50 text-white placeholder:text-zinc-600 outline-none transition-all" 
                    placeholder="Ask about deposits, plans, or security..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={handleSend} 
                    className="bg-primary px-5 rounded-xl text-black font-black uppercase text-[10px] tracking-widest hover:bg-primary-fixed transition-colors shadow-lg shadow-primary/20"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-6 pb-6 flex gap-2 flex-wrap">
                 {['How to Deposit?', 'Silver ROI?', 'Platinum Min?'].map(action => (
                   <button 
                     key={action}
                     onClick={() => { setInput(action); }}
                     className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-zinc-500 hover:text-primary hover:border-primary/30 transition-all uppercase tracking-widest"
                   >
                     {action}
                   </button>
                 ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SupportChat;
