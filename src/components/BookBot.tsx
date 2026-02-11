'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Bot, Sparkles, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function BookBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messageCounter, setMessageCounter] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();

  const { data: suggestionsData } = trpc.bookBot.getSuggestions.useQuery();

  const sendMessage = trpc.bookBot.chat.useMutation({
    onSuccess: data => {
      const assistantMessage: Message = {
        id: `${uniqueId}-${messageCounter}-assistant`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp),
      };
      setMessageCounter(c => c + 1);
      setMessages(prev => [...prev, assistantMessage]);
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || sendMessage.isPending) return;

    // Add user message
    const userMessage: Message = {
      id: `${uniqueId}-${messageCounter}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessageCounter(c => c + 1);
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowSuggestions(false);

    // Send to API with conversation history
    const history = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    sendMessage.mutate({
      message: text,
      conversationHistory: history,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl transition-colors ${isOpen
            ? 'bg-secondary text-muted-foreground'
            : 'bg-accent text-accent-foreground shadow-accent/30'
          }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open BookBot'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Badge when closed */}
      <AnimatePresence>
        {!isOpen && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 right-6 z-40"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg"
            >
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                Need help?
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/30">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"
                >
                  <Bot className="w-5 h-5 text-accent" />
                </motion.div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">BookBot</h3>
                <p className="text-xs text-muted-foreground">
                  AI Assistant • Online
                </p>
              </div>
              <motion.button
                onClick={() => {
                  setMessages([]);
                  setShowSuggestions(true);
                }}
                className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Clear chat"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center"
                  >
                    <Bot className="w-8 h-8 text-accent" />
                  </motion.div>
                  <h4 className="font-bold text-foreground mb-1">
                    Hi! I&apos;m BookBot 👋
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your AI assistant for discovering books
                  </p>
                </motion.div>
              )}

              {/* Suggestions */}
              {showSuggestions &&
                messages.length === 0 &&
                suggestionsData?.suggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Try asking:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestionsData.suggestions
                        .slice(0, 4)
                        .map((suggestion, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1.5 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-accent/10 hover:text-accent transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                    </div>
                  </motion.div>
                )}

              {/* Message Bubbles */}
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${message.role === 'user'
                        ? 'bg-accent text-accent-foreground rounded-br-md'
                        : 'bg-secondary text-foreground rounded-bl-md'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {sendMessage.isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me about books..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm transition-colors"
                  disabled={sendMessage.isPending}
                />
                <motion.button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || sendMessage.isPending}
                  className="px-3 py-2.5 rounded-xl bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Powered by AI • Responses may vary
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
