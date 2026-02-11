'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc';
import {
    subscribeToConversation,
    ChatMessageNotification,
} from '@/lib/pusher-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Search,
    MoreVertical,
    Paperclip,
    Smile,
    ChevronLeft,
    MessageCircle,
    BookOpen,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date | string;
    isRead: boolean;
}

interface Conversation {
    id: string;
    bookId: string;
    participant1: string;
    participant2: string;
    lastMessage: string | null;
    lastMessageAt: Date | string | null;
    book: {
        id: string;
        title: string;
        images: string[];
    };
    otherParticipant: {
        id: string;
        name: string;
        image: string | null;
    } | null;
    unreadCount: number;
}

function ChatPageContent() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const bookIdParam = searchParams.get('bookId');
    const ownerIdParam = searchParams.get('ownerId');
    const conversationIdParam = searchParams.get('conversationId');

    const utils = trpc.useUtils();

    // Get all conversations
    const { data: conversations, isLoading: loadingConversations } =
        trpc.chat.getConversations.useQuery(undefined, {
            enabled: !!session,
        });

    // Get messages for selected conversation
    const { data: messagesData, isLoading: loadingMessages } =
        trpc.chat.getMessages.useQuery(
            { conversationId: selectedConversationId! },
            {
                enabled: !!selectedConversationId,
            }
        );

    // Get or create conversation mutation
    const getOrCreateConversation = trpc.chat.getOrCreateConversation.useMutation({
        onSuccess: (data) => {
            setSelectedConversationId(data.id);
            setShowMobileSidebar(false);
            utils.chat.getConversations.invalidate();
        },
    });

    // Send message mutation
    const sendMessage = trpc.chat.sendMessage.useMutation({
        onSuccess: () => {
            setMessageInput('');
            utils.chat.getMessages.invalidate({ conversationId: selectedConversationId! });
            utils.chat.getConversations.invalidate();
        },
    });

    // Mark as read mutation
    const markAsRead = trpc.chat.markAsRead.useMutation({
        onSuccess: () => {
            utils.chat.getConversations.invalidate();
        },
    });

    // Handle direct conversationId param
    useEffect(() => {
        if (conversationIdParam && session) {
            setSelectedConversationId(conversationIdParam);
        }
    }, [conversationIdParam, session]);

    // Handle initial bookId/ownerId params
    useEffect(() => {
        if (bookIdParam && ownerIdParam && session) {
            getOrCreateConversation.mutate({
                bookId: bookIdParam,
                ownerId: ownerIdParam,
            });
        }
    }, [bookIdParam, ownerIdParam, session]);

    // Update messages when data changes
    useEffect(() => {
        if (messagesData?.messages) {
            setMessages(messagesData.messages);
        }
    }, [messagesData]);

    // Subscribe to real-time messages
    useEffect(() => {
        if (!selectedConversationId) return;

        const unsubscribe = subscribeToConversation(
            selectedConversationId,
            (data: ChatMessageNotification) => {
                if (data.senderId !== session?.user?.id) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: data.id,
                            content: data.content,
                            senderId: data.senderId,
                            createdAt: data.createdAt,
                            isRead: false,
                        },
                    ]);
                }
            }
        );

        return () => unsubscribe();
    }, [selectedConversationId, session?.user?.id]);

    // Mark messages as read
    useEffect(() => {
        if (selectedConversationId && session) {
            markAsRead.mutate({ conversationId: selectedConversationId });
        }
    }, [selectedConversationId, session]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, messagesData]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversationId) return;

        // Optimistic update
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            content: messageInput,
            senderId: session?.user?.id || '',
            createdAt: new Date().toISOString(),
            isRead: false,
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        sendMessage.mutate({
            conversationId: selectedConversationId,
            content: messageInput,
        });
    };

    const handleSelectConversation = (convId: string) => {
        setSelectedConversationId(convId);
        setShowMobileSidebar(false);
    };

    const selectedConversation = conversations?.find(
        (c) => c.id === selectedConversationId
    );

    const filteredConversations = conversations?.filter(c =>
        c.otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!session) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center pt-24 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md w-full bg-card border border-border p-8 rounded-2xl shadow-xl"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                        className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6"
                    >
                        <MessageCircle className="w-8 h-8 text-accent" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to Chat</h2>
                    <p className="text-muted-foreground mb-6">
                        Connect with book lovers and arrange exchanges instantly.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/signin">
                            <motion.div
                                className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold cursor-pointer text-center shadow-lg shadow-accent/20"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Sign In
                            </motion.div>
                        </Link>
                        <Link href="/signup">
                            <motion.div
                                className="w-full py-3 rounded-xl bg-secondary text-foreground font-semibold cursor-pointer text-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Create Account
                            </motion.div>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen pt-20 pb-4 px-4 sm:px-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden h-full flex flex-col lg:flex-row"
            >
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {showMobileSidebar && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileSidebar(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <motion.aside
                    className={`absolute lg:relative inset-y-0 left-0 z-50 w-full sm:w-80 md:w-96 bg-card lg:bg-card/50 border-r border-border flex flex-col transition-transform duration-300
                        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    {/* Sidebar Header */}
                    <div className="p-5 border-b border-border">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-accent" />
                                </div>
                                <h1 className="text-xl font-bold text-foreground">Messages</h1>
                            </div>
                            <button className="p-2 hover:bg-secondary rounded-xl transition-colors lg:hidden" onClick={() => setShowMobileSidebar(false)}>
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-accent/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {loadingConversations ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="p-3 flex gap-3 animate-pulse">
                                    <div className="w-12 h-12 rounded-full bg-secondary" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-secondary rounded w-2/3" />
                                        <div className="h-3 bg-secondary rounded w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : filteredConversations?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-3">
                                    <MessageCircle className="w-7 h-7 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">No messages found</p>
                                <p className="text-xs text-muted-foreground mt-1">Start chatting by exchanging books!</p>
                            </div>
                        ) : (
                            filteredConversations?.map((conv, i) => (
                                <motion.button
                                    key={conv.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => handleSelectConversation(conv.id)}
                                    className={`w-full p-3 flex gap-3 rounded-xl transition-all group mb-1
                                        ${selectedConversationId === conv.id
                                            ? 'bg-accent/10 border border-accent/20'
                                            : 'hover:bg-secondary border border-transparent'
                                        }
                                    `}
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary border-2 border-background">
                                            {conv.otherParticipant?.image ? (
                                                <img
                                                    src={conv.otherParticipant.image}
                                                    alt={conv.otherParticipant.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-accent text-accent-foreground font-bold text-lg">
                                                    {conv.otherParticipant?.name[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={`font-semibold truncate ${selectedConversationId === conv.id ? 'text-accent' : 'text-foreground'}`}>
                                                {conv.otherParticipant?.name}
                                            </h3>
                                            {conv.lastMessageAt && (
                                                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                                    {new Date(conv.lastMessageAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs truncate flex items-center gap-1.5 text-muted-foreground">
                                            <BookOpen className="w-3 h-3 shrink-0" />
                                            {conv.book.title}
                                        </p>

                                        <p className={`text-sm truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                            {conv.lastMessage || 'Start a conversation'}
                                        </p>
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <div className="shrink-0 self-center">
                                            <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                                                {conv.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </motion.button>
                            ))
                        )}
                    </div>
                </motion.aside>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-secondary/20">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <header className="h-16 px-4 border-b border-border flex items-center justify-between bg-card">
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        onClick={() => setShowMobileSidebar(true)}
                                        className="lg:hidden p-2 -ml-2 hover:bg-secondary rounded-xl transition-colors"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </motion.button>

                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary border border-border">
                                                {selectedConversation.otherParticipant?.image ? (
                                                    <img src={selectedConversation.otherParticipant.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-accent text-accent-foreground font-bold">
                                                        {selectedConversation.otherParticipant?.name[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-foreground text-sm">
                                                {selectedConversation.otherParticipant?.name}
                                            </h2>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" />
                                                {selectedConversation.book.title}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                                            <MessageCircle className="w-8 h-8 text-accent" />
                                        </div>
                                        <p className="text-lg font-medium text-foreground">No messages yet</p>
                                        <p className="text-sm text-muted-foreground">Send a message to start the conversation!</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {messages.map((message, index) => {
                                            const isSent = message.senderId === session?.user?.id;
                                            const showAvatar = !isSent && (index === 0 || messages[index - 1].senderId !== message.senderId);
                                            const isConsecutive = index > 0 && messages[index - 1].senderId === message.senderId;

                                            return (
                                                <motion.div
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex gap-2 ${isSent ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}
                                                >
                                                    {!isSent && (
                                                        <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                                                            {showAvatar ? (
                                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary border border-border">
                                                                    {selectedConversation.otherParticipant?.image ? (
                                                                        <img src={selectedConversation.otherParticipant.image} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-secondary text-xs font-bold">
                                                                            {selectedConversation.otherParticipant?.name[0]}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : <div className="w-8" />}
                                                        </div>
                                                    )}

                                                    <div className="max-w-[75%] sm:max-w-[65%] group relative">
                                                        <div
                                                            className={`px-4 py-2.5 text-sm leading-relaxed
                                                                ${isSent
                                                                    ? 'bg-accent text-accent-foreground rounded-2xl rounded-br-md'
                                                                    : 'bg-card border border-border text-foreground rounded-2xl rounded-bl-md'
                                                                }
                                                            `}
                                                        >
                                                            {message.content}
                                                        </div>

                                                        <div className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 ${isSent ? 'right-full mr-2' : 'left-full ml-2'} text-muted-foreground whitespace-nowrap`}>
                                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-card border-t border-border">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-end gap-2 bg-secondary rounded-2xl p-2 pr-2"
                                >
                                    <button
                                        type="button"
                                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-xl transition-colors hidden sm:block"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>

                                    <textarea
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        rows={1}
                                        className="flex-1 bg-transparent px-2 py-2 max-h-32 min-h-[40px] outline-none text-foreground placeholder:text-muted-foreground resize-none text-sm"
                                    />

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-card rounded-xl transition-colors hidden sm:block"
                                        >
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        <motion.button
                                            type="submit"
                                            disabled={!messageInput.trim() || sendMessage.isPending}
                                            className="p-2.5 rounded-xl bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {sendMessage.isPending ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                                    className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                                >
                                    <MessageCircle className="w-10 h-10 text-accent" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Messages</h2>
                                <p className="text-muted-foreground max-w-md">
                                    Select a conversation or browse the{' '}
                                    <Link href="/books" className="text-accent hover:underline font-medium">
                                        Library
                                    </Link>{' '}
                                    to start exchanging!
                                </p>
                                <Link href="/books">
                                    <motion.div
                                        className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold cursor-pointer"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        Browse Books
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </div>
                    )}
                </main>
            </motion.div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center pt-24">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            }
        >
            <ChatPageContent />
        </Suspense>
    );
}
