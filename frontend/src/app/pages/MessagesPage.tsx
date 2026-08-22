import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCheck, MessageCircle, UserCheck, X, Loader2 } from 'lucide-react';
import { chatApi, connectionApi } from '../services/api';
import { socketService } from '../services/socket';
import { ApiConversation, ApiMessage, ApiConnectionRequest } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Avatar } from '../components/Avatar';

const avatarColors = ['#D70040', '#7c3aed', '#0891b2', '#059669', '#d97706'];

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [requests, setRequests] = useState<ApiConnectionRequest[]>([]);
  const [activeConv, setActiveConv] = useState<ApiConversation | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'chats' | 'requests'>('chats');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      if (res.success) setConversations(res.data?.conversations || []);
    } catch { /* ignore */ }
  };

  const loadRequests = async () => {
    try {
      const res = await connectionApi.getReceived();
      if (res.success) setRequests(res.data?.requests || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadConversations(), loadRequests()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket Listeners
  useEffect(() => {
    socketService.on('chat:new-message', (msg: ApiMessage) => {
      // Only add message if it belongs to the active conversation
      if (activeConv && msg.conversation === activeConv._id) {
        setMessages(prev => {
          // Avoid duplicate messages
          // 1. Check by ID (real ID)
          if (prev.find(m => m._id === msg._id)) return prev;
          
          // 2. Check if this is a response to our optimistic update
          // If the last message is temporary and has the same text, replace it or skip this one
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg._id.startsWith('temp-') && lastMsg.text === msg.text) {
            // Replace the temp message with the real one
            return [...prev.slice(0, -1), msg];
          }

          return [...prev, msg];
        });
      }
      
      // Update the conversations list (preview and unread count)
      setConversations(prev => prev.map(c => {
        if (c._id === msg.conversation) {
          return {
            ...c,
            lastMessage: msg.text,
            lastMessageTime: msg.createdAt,
            unreadCount: (activeConv?._id === c._id) ? 0 : (c.unreadCount || 0) + 1
          };
        }
        return c;
      }));
    });

    return () => {
      socketService.off('chat:new-message');
    };
  }, [activeConv]);

  const openConversation = async (conv: ApiConversation) => {
    setActiveConv(conv);
    setMsgLoading(true);
    
    // Join socket room
    socketService.emit('chat:join', { conversationId: conv._id });

    try {
      const res = await chatApi.getMessages(conv._id);
      if (res.success) setMessages(res.data?.messages || []);
      await chatApi.markRead(conv._id);
      setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
    } catch { toast.error('Failed to load messages'); }
    finally { setMsgLoading(false); }
  };

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return;
    const msgText = text.trim();
    setText('');

    // Emit message to socket
    socketService.emit('chat:send-message', {
      conversationId: activeConv._id,
      text: msgText,
      mediaType: 'text'
    });

    // Optimistic update (with temporary ID)
    const tempMsg: ApiMessage = {
      _id: `temp-${Date.now()}`,
      conversation: activeConv._id,
      sender: user as any,
      text: msgText,
      mediaType: 'text',
      seenBy: [user!._id],
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
  };

  const handleAccept = async (requestId: string, name: string) => {
    setAccepting(requestId);
    try {
      const res = await connectionApi.accept(requestId);
      if (res.success) {
        toast.success(`Connected with ${name}! You can now chat.`);
        await Promise.all([loadConversations(), loadRequests()]);
      } else toast.error(res.message);
    } catch { toast.error('Failed to accept request'); }
    finally { setAccepting(null); }
  };

  const handleDecline = async (requestId: string) => {
    try {
      const res = await connectionApi.decline(requestId);
      if (res.success) { toast.success('Request declined'); loadRequests(); }
    } catch { toast.error('Failed to decline request'); }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => {
    const dt = new Date(d);
    const now = new Date();
    if (dt.toDateString() === now.toDateString()) return formatTime(d);
    return dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-pink-50 via-white to-red-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3">Messages</h2>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['chats', 'requests'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}>
                {t === 'chats' ? 'Chats' : `Requests ${requests.length > 0 ? `(${requests.length})` : ''}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}</div>
          ) : tab === 'chats' ? (
            conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm text-center">No conversations yet. Accept requests to start chatting!</p>
              </div>
            ) : conversations.map((conv, i) => (
              <button key={conv._id} onClick={() => openConversation(conv)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeConv?._id === conv._id ? 'bg-pink-50' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <Avatar 
                      src={conv.otherUser?.profilePhoto} 
                      name={conv.otherUser?.name} 
                      size="md" 
                    />
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D70040] text-white text-[9px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-gray-900 truncate">{conv.otherUser?.name}</p>
                    <p className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{conv.lastMessageTime ? formatDate(conv.lastMessageTime) : ''}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || 'Start the conversation...'}</p>
                </div>
              </button>
            ))
          ) : (
            requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <UserCheck className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No pending requests</p>
              </div>
            ) : requests.map((req, i) => (
              <div key={req._id} className="p-4 border-b border-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar 
                    src={req.fromUser?.profilePhoto} 
                    name={req.fromUser?.name} 
                    size="md" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{req.fromUser?.name}</p>
                    <p className="text-xs text-gray-500">{req.fromUser?.city} · {req.fromUser?.profession}</p>
                  </div>
                </div>
                {req.message && <p className="text-xs text-gray-600 italic mb-3 bg-gray-50 rounded-lg p-2">"{req.message}"</p>}
                <div className="flex gap-2">
                  <button onClick={() => handleDecline(req._id)}
                    className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                    <X className="w-3 h-3" /> Decline
                  </button>
                  <button onClick={() => handleAccept(req._id, req.fromUser?.name)} disabled={accepting === req._id}
                    className="flex-1 py-1.5 bg-[#D70040] text-white rounded-lg text-xs font-medium hover:bg-[#B00034] transition-colors flex items-center justify-center gap-1 disabled:opacity-60">
                    {accepting === req._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                    Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3">
            <Avatar 
              src={activeConv.otherUser?.profilePhoto} 
              name={activeConv.otherUser?.name} 
              size="sm" 
            />
            <div>
              <p className="font-semibold text-sm text-gray-900">{activeConv.otherUser?.name}</p>
              <p className="text-xs text-gray-400">{activeConv.otherUser?.city}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
            ) : messages.map((msg) => {
              const isMine = msg.sender?._id === user?._id;
              return (
                <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${isMine ? 'bg-[#D70040] text-white rounded-br-sm' : 'bg-white shadow-sm text-gray-800 rounded-bl-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] ${isMine ? 'text-red-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-red-200" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="bg-white border-t border-gray-100 p-4 flex items-center gap-3">
            <input value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D70040] focus:outline-none text-sm" />
            <button onClick={handleSend} disabled={!text.trim()}
              className="w-10 h-10 bg-[#D70040] text-white rounded-xl flex items-center justify-center hover:bg-[#B00034] transition-colors disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-semibold text-gray-500">Select a conversation</p>
          <p className="text-sm mt-1">or accept a connection request to start chatting</p>
        </div>
      )}
    </div>
  );
}
