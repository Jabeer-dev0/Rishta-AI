import { Link } from 'react-router';
import { Heart, User, Compass, Sparkles, MessageCircle, Settings, TrendingUp, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

export default function Navigation() {
  const { user } = useAuth();
  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-2xl font-bold text-primary">Rishta AI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Dashboard
              </Link>
              <Link to="/explore" className="text-gray-600 hover:text-primary flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Explore
              </Link>
              <Link to="/ai-matches" className="text-gray-600 hover:text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Matches
              </Link>
              <Link to="/chat" className="text-gray-600 hover:text-primary flex items-center gap-2 relative">
                <MessageCircle className="w-5 h-5" />
                Chat
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-primary flex items-center gap-2">
                <Avatar src={user?.profilePhoto} name={user?.name} size="sm" />
                Profile
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-full">
                <Settings className="w-6 h-6 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
        <div className="flex justify-around py-3">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-600">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/explore" className="flex flex-col items-center gap-1 text-gray-600">
            <Compass className="w-6 h-6" />
            <span className="text-xs">Explore</span>
          </Link>
          <Link to="/ai-matches" className="flex flex-col items-center gap-1 text-gray-600">
            <Sparkles className="w-6 h-6" />
            <span className="text-xs">Matches</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center gap-1 text-gray-600 relative">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Chat</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-600">
            <Avatar src={user?.profilePhoto} name={user?.name} size="sm" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
