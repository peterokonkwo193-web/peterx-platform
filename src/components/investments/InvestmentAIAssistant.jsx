import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { cn } from '../../utils/cn';

const RESPONSES = {
  plans: "We offer four institutional-grade strategies: Starter (7 days, 12% ROI), Silver (14 days, 25% ROI), Gold (21 days, 45% ROI), and Platinum (30 days, 75% ROI). All plans feature zero-slippage execution.",
  recommend: "For most institutional partners, I recommend the Gold Institutional plan. It offers an optimal balance of duration (21 days) and a high yield of 45%.",
  risks: "Investment involves protocol lock-ins. Once allocated, funds cannot be terminated until the maturity date. However, our secondary liquidity pool ensures 99.9% protocol efficiency.",
  roi: "ROI (Return on Investment) is calculated based on the principal amount. For example, a $10,000 allocation in our Gold plan yields a $4,500 profit upon maturity.",
  starter: "The Starter Protocol is ideal for testing our liquidity depth. With a $1,000 minimum and a 7-day maturity, it's our most flexible entry point.",
  platinum: "Platinum Elite is designed for high-net-worth allocations. It requires $15,000 and offers a premium 75% yield over 30 days.",
  default: "I am your Investment Intelligence co-pilot. I can explain our protocol strategies, ROI calculations, or help you choose the best allocation for your portfolio. What would you like to know?"
};

const InvestmentAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Protocol Intelligence online. I am your Investment Assistant. How can I optimize your capital allocation today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('plan') || q.includes('option') || q.includes('strategy')) return RESPONSES.plans;
    if (q.includes('recommend') || q.includes('best') || q.includes('choose')) return RESPONSES.recommend;
    if (q.includes('risk') || q.includes('safe') || q.includes('loss')) return RESPONSES.risks;
    if (q.includes('roi') || q.includes('profit') || q.includes('earn')) return RESPONSES.roi;
    if (q.includes('starter')) return RESPONSES.starter;
    if (q.includes('platinum')) return RESPONSES.platinum;
    return RESPONSES.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg = { 
        role: 'assistant', 
        content: getResponse(currentInput)
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 800 + Math.random() * 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="mb-6"
          >
            <Card className="w-[380px] h-[550px] flex flex-col p-0 shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-primary/20 overflow-hidden" glass>
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(252,213,53,0.3)]">
                      <span className="material-symbols-outlined text-black">smart_toy</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-zinc-950"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Investment AI</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Protocol Intelligence</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Chat Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-zinc-950/20"
              >
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
                  >
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-[12px] leading-relaxed font-medium shadow-sm",
                      msg.role === 'user' 
                        ? "bg-white/10 text-zinc-100 rounded-tr-none border border-white/5" 
                        : "bg-primary/5 text-zinc-300 rounded-tl-none border border-primary/10"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1.5 px-1">
                      {msg.role === 'user' ? 'Client' : 'AI Assistant'}
                    </span>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Analyzing...</span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 bg-zinc-950/40 border-t border-white/5">
                <div className="relative group">
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-all focus:bg-white/[0.07]" 
                    placeholder="Ask about ROI or Plans..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary rounded-xl text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-[18px] font-bold">send</span>
                  </button>
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                   {['Plans', 'Recommend', 'Risks'].map(tag => (
                     <button 
                       key={tag}
                       onClick={() => {
                         setInput(`Tell me about ${tag}`);
                         handleSend();
                       }}
                       className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                     >
                       {tag}
                     </button>
                   ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 px-6 rounded-2xl flex items-center gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-500 transform hover:scale-105 active:scale-95 group",
          isOpen 
            ? "bg-zinc-900 border border-white/10 text-zinc-400" 
            : "bg-primary border border-primary/20 text-black shadow-primary/30"
        )}
      >
        <div className="relative">
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">
            {isOpen ? 'close' : 'forum'}
          </span>
          {!isOpen && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full border-2 border-primary animate-pulse"></span>}
        </div>
        <span className="text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">
          {isOpen ? 'Close Intelligence' : 'Ask AI Assistant'}
        </span>
      </button>
    </div>
  );
};

export default InvestmentAIAssistant;
