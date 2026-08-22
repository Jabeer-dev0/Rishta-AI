import { useState } from 'react';
import { Send, Smile, Mic, Lightbulb, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import Navigation from '../components/Navigation';

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  const conversations = [
    {
      id: 1,
      name: 'Sarah Ahmed',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      lastMessage: 'That sounds wonderful!',
      time: '2m ago',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Fatima Khan',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      lastMessage: 'I love photography too!',
      time: '1h ago',
      unread: 1,
      online: true,
    },
    {
      id: 3,
      name: 'Aisha Malik',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
      lastMessage: 'Thank you for sharing that',
      time: '3h ago',
      unread: 0,
      online: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'other',
      text: 'Hi! I saw we have a 92% match. Your profile really stood out to me!',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'me',
      text: 'Thank you! I really enjoyed reading about your interests. Traveling and reading are passions of mine too!',
      time: '10:32 AM',
    },
    {
      id: 3,
      sender: 'other',
      text: 'That\'s wonderful! What\'s the last book you read?',
      time: '10:35 AM',
    },
    {
      id: 4,
      sender: 'me',
      text: 'I just finished "The Alchemist" - it was beautiful. Have you read it?',
      time: '10:37 AM',
    },
    {
      id: 5,
      sender: 'other',
      text: 'Yes! One of my favorites. The message about following your dreams really resonated with me.',
      time: '10:40 AM',
    },
  ];

  const aiSuggestions = [
    "That's a great question! I've always been passionate about...",
    "I'd love to hear more about your experiences with...",
    "What inspired you to pursue a career in medicine?",
  ];

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      setMessage('');
      setShowAISuggestions(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex flex-col">
      <Navigation />

      <div className="flex-1 container mx-auto px-4 py-8 flex gap-6 overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedChat === conversation.id
                    ? 'bg-primary/10'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conversation.image}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{conversation.name}</h3>
                      <span className="text-xs text-gray-500">{conversation.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 bg-white rounded-2xl shadow-lg overflow-hidden flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedConversation?.image}
                  alt={selectedConversation?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {selectedConversation?.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{selectedConversation?.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation?.online ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-500'}`}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-sm">Sarah is typing...</span>
            </div>
          </div>

          {/* AI Suggestions */}
          {showAISuggestions && (
            <div className="px-6 py-3 bg-purple-50 border-t border-purple-100">
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900 mb-2">AI Suggested Replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(suggestion)}
                        className="px-3 py-1.5 bg-white text-sm text-gray-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Warning (if applicable) */}
          <div className="px-6 py-2 bg-yellow-50 border-t border-yellow-100 hidden">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-xs text-yellow-800">
                AI detected potentially sensitive content. Please communicate respectfully.
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Smile className="w-6 h-6 text-gray-600" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full outline-none focus:bg-gray-200 transition-colors"
              />
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Mic className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={handleSend}
                className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
