'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ExternalLink,
  RotateCcw,
  Plane,
  ShieldCheck,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { WhatsAppIcon } from './whatsapp-button';
import {
  WHATSAPP_CONFIG,
  getWhatsAppUrl,
  getTopicWhatsAppUrl,
  WhatsAppTopic,
} from '@/lib/whatsapp';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      'Assalam-o-Alaikum! 👋 Welcome to **Fzee Travels and Tours**.\n\nI am your AI Travel Assistant. How can I help you today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const QUICK_PROMPTS = [
  { label: '🕋 Umrah Packages', query: 'Tell me about Umrah packages and hotel accommodations.' },
  { label: '✈️ Book Flights', query: 'I want to inquire about international and domestic flight fares.' },
  { label: '🛂 Visa Guidance', query: 'What visa assistance do you provide?' },
  { label: '💼 B2B Agent Signup', query: 'How can I register as a B2B Travel Agent?' },
  { label: '🏨 Hotel Bookings', query: 'Show me hotel reservation options in Makkah and Madinah.' },
];

export function FloatingSupportHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'whatsapp'>('ai');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // WhatsApp custom message input
  const [waCustomMessage, setWaCustomMessage] = useState('');
  const [selectedDesk, setSelectedDesk] = useState<'primary' | 'secondary'>('primary');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'ai') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  // Hide initial floating tooltip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          data.response ||
          'You can contact our live agents on WhatsApp for immediate assistance at **0330 4084080**!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'I am currently experiencing connection issues. Please reach us directly on WhatsApp at **0330 4084080** or **0331 4084080** for assistance!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const handleQuickTopicLaunch = (topic: WhatsAppTopic) => {
    const url = getTopicWhatsAppUrl(topic);
    window.open(url, '_blank');
  };

  const handleWaCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    const url = getWhatsAppUrl(
      waCustomMessage || 'Hello Fzee Travels, I would like to make an inquiry.',
      selectedDesk
    );
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end pointer-events-auto max-w-full">
      {/* Floating Tooltip Notification */}
      {showTooltip && !isOpen && (
        <div className="mb-2.5 animate-bounce w-[calc(100vw-2rem)] sm:w-auto sm:max-w-xs bg-card border border-border shadow-xl rounded-2xl p-3 flex items-center gap-3 relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -right-1.5 bg-muted text-muted-foreground hover:text-foreground rounded-full p-1"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0">
            <WhatsAppIcon className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-foreground">Need Travel Help?</p>
            <p className="text-muted-foreground text-[11px]">Chat with Fzee AI or WhatsApp Support!</p>
          </div>
        </div>
      )}

      {/* Main Drawer / Widget Window */}
      {isOpen && (
        <div className="w-[calc(100vw-1.5rem)] xs:w-[360px] sm:w-[400px] md:w-[420px] h-[calc(100vh-5.5rem)] sm:h-[580px] max-h-[580px] sm:max-h-[82vh] bg-card border border-border/80 shadow-2xl rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden mb-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-primary/95 to-slate-900 text-white p-3.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3 relative shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                  <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-tight truncate">
                    Fzee Support Hub
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/80">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span className="truncate">Live Agents & AI Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {activeTab === 'ai' && (
                  <button
                    onClick={handleResetChat}
                    title="Reset Chat"
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                  aria-label="Close support drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-black/25 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-2 px-2.5 sm:px-3 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  activeTab === 'ai'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">AI Travel Bot</span>
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`py-2 px-2.5 sm:px-3 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  activeTab === 'whatsapp'
                    ? 'bg-[#25D366] text-white shadow-sm font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">WhatsApp Desk</span>
              </button>
            </div>
          </div>

          {/* TAB 1: AI Chatbot */}
          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col min-h-0 bg-background/50">
              {/* Chat Scroll Container */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 sm:gap-2.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[82%] rounded-2xl p-2.5 sm:p-3 shadow-xs space-y-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-card border border-border/70 text-foreground rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed text-xs break-words">
                        {msg.content}
                      </div>

                      {/* Handoff to WhatsApp CTA inside assistant responses */}
                      {msg.role === 'assistant' && (
                        <div className="pt-1">
                          <a
                            href={getWhatsAppUrl(`Inquiry from Chatbot:\n"${msg.content.slice(0, 100)}..."`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white font-medium text-[11px] rounded-lg transition-colors border border-[#25D366]/20 max-w-full truncate"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Continue on WhatsApp</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70 shrink-0" />
                          </a>
                        </div>
                      )}

                      <div
                        className={`text-[9px] text-right font-mono ${
                          msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2 sm:gap-2.5 justify-start">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="bg-card border border-border p-2.5 sm:p-3 rounded-2xl rounded-bl-xs text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                      <span>Fzee AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div className="px-2.5 py-2 border-t border-border/60 bg-muted/30 overflow-x-auto flex gap-1.5 no-scrollbar scrollbar-none shrink-0">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.query)}
                    className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full bg-card hover:bg-primary hover:text-primary-foreground border border-border/80 transition-colors shadow-2xs shrink-0"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 sm:p-3 border-t border-border bg-card flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ask Fzee AI anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 min-w-0 bg-muted/60 hover:bg-muted text-foreground text-xs px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-border/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Direct WhatsApp Support */}
          {activeTab === 'whatsapp' && (
            <div className="flex-1 flex flex-col overflow-y-auto p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 bg-background/50 text-xs">
              {/* Official Numbers Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 p-3 sm:p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-foreground text-xs sm:text-sm">
                  <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#25D366] shrink-0" />
                  <span>Official WhatsApp Support Desks</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-snug">
                  Connect directly with our dedicated travel experts for instant responses & fast bookings.
                </p>
              </div>

              {/* Desk Selectors */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                  Select Contact Desk
                </h4>

                {/* Primary Desk */}
                <a
                  href={getWhatsAppUrl('Hello! I would like to make an inquiry.', 'primary')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-card hover:bg-emerald-500/5 border border-border hover:border-[#25D366]/60 rounded-2xl transition-all shadow-xs group"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-foreground flex flex-wrap items-center gap-1.5 text-xs">
                        <span>{WHATSAPP_CONFIG.primary.label}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/15 text-[#25D366] text-[10px] font-bold rounded-md font-mono">
                          0330 4084080
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {WHATSAPP_CONFIG.primary.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </a>

                {/* Secondary Desk */}
                <a
                  href={getWhatsAppUrl('Hello! I am an agent inquiring about B2B portal registration.', 'secondary')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-card hover:bg-emerald-500/5 border border-border hover:border-[#25D366]/60 rounded-2xl transition-all shadow-xs group"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-foreground flex flex-wrap items-center gap-1.5 text-xs">
                        <span>{WHATSAPP_CONFIG.secondary.label}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/15 text-[#25D366] text-[10px] font-bold rounded-md font-mono">
                          0331 4084080
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {WHATSAPP_CONFIG.secondary.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </a>
              </div>

              {/* Quick Topic Triggers */}
              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                  Quick Inquiries via WhatsApp
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleQuickTopicLaunch('umrah')}
                    className="p-2 sm:p-2.5 bg-card hover:bg-emerald-500/10 border border-border/80 rounded-xl text-left font-medium transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>🕋</span>
                    <span className="text-[11px] font-semibold truncate">Umrah Packages</span>
                  </button>
                  <button
                    onClick={() => handleQuickTopicLaunch('flights')}
                    className="p-2 sm:p-2.5 bg-card hover:bg-emerald-500/10 border border-border/80 rounded-xl text-left font-medium transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>✈️</span>
                    <span className="text-[11px] font-semibold truncate">Flight Booking</span>
                  </button>
                  <button
                    onClick={() => handleQuickTopicLaunch('visa')}
                    className="p-2 sm:p-2.5 bg-card hover:bg-emerald-500/10 border border-border/80 rounded-xl text-left font-medium transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>🛂</span>
                    <span className="text-[11px] font-semibold truncate">Visa Guidance</span>
                  </button>
                  <button
                    onClick={() => handleQuickTopicLaunch('b2b_agent')}
                    className="p-2 sm:p-2.5 bg-card hover:bg-emerald-500/10 border border-border/80 rounded-xl text-left font-medium transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>💼</span>
                    <span className="text-[11px] font-semibold truncate">B2B Agent Portal</span>
                  </button>
                </div>
              </div>

              {/* Custom WhatsApp Form */}
              <form onSubmit={handleWaCustomSend} className="space-y-2 pt-2 border-t border-border mt-auto">
                <label className="block text-[11px] font-bold text-foreground">
                  Type Custom WhatsApp Message
                </label>
                <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-3 text-[10px]">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="desk"
                      checked={selectedDesk === 'primary'}
                      onChange={() => setSelectedDesk('primary')}
                      className="accent-[#25D366]"
                    />
                    <span>0330 4084080 (General)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="desk"
                      checked={selectedDesk === 'secondary'}
                      onChange={() => setSelectedDesk('secondary')}
                      className="accent-[#25D366]"
                    />
                    <span>0331 4084080 (Agents)</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={waCustomMessage}
                    onChange={(e) => setWaCustomMessage(e.target.value)}
                    className="flex-1 min-w-0 bg-card border border-border text-foreground text-xs px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/40"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold flex items-center gap-1 shrink-0 cursor-pointer text-xs"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`group relative flex items-center justify-center p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-slate-900 text-white rotate-90 scale-90'
            : 'bg-[#25D366] hover:bg-[#20ba5a] text-white hover:scale-105 shadow-[#25D366]/40'
        }`}
        aria-label="Toggle support chat drawer"
      >
        {/* Pulsing outer ring */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none"></span>
        )}

        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <div className="relative flex items-center justify-center">
            <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-[#25D366] items-center justify-center">
                <Sparkles className="w-2 h-2 text-slate-900" />
              </span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
