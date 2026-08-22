import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Heart, LayoutDashboard, Compass, Sparkles,
  MessageCircle, User, Settings, Bell, LogOut,
  Share2, Brain, Menu, X, ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const navItems = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/app/explore', label: 'Explore', icon: Compass },
  { path: '/app/matches', label: 'AI Matches', icon: Sparkles },
  { path: '/app/messages', label: 'Messages', icon: MessageCircle },
  { path: '/app/personality-test', label: 'Personality Test', icon: Brain },
  { path: '/app/social-media', label: 'Social Media', icon: Share2 },
  { path: '/app/profile', label: 'Profile', icon: User, exact: true },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth guard — wait for session restore, then redirect if not logged in
  useEffect(() => {
    console.log("user: ", user);
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  // Show a full-screen spinner while restoring session from localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Heart className="w-10 h-10 text-[#D70040] fill-[#D70040] animate-pulse" />
          <p className="text-sm text-gray-500">Loading Rishtaai...</p>
        </div>
      </div>
    );
  }

  // Don't render children until user is confirmed
  if (!user) return null;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    if (path === '/app/profile') {
      return location.pathname === '/app/profile' || location.pathname.startsWith('/app/profile/edit');
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Combine static items with conditional admin item
  const allNavItems = [
    ...navItems,
    ...(user?.role === 'admin' ? [{ path: '/app/admin', label: 'Admin Panel', icon: ShieldCheck }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm fixed top-0 left-0 h-full z-20">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-[#D70040] fill-[#D70040]" />
            <span className="text-2xl font-bold text-[#D70040]">Rishtaai</span>
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 mx-3 mt-4 bg-gradient-to-r from-[#D70040]/5 to-[#FFE5EC] rounded-2xl">
            <div className="flex items-center gap-3">
              <Avatar 
                src={user.profilePhoto} 
                name={user.name} 
                size="md" 
                className="w-10 h-10 border-2 border-[#D70040]/30"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                <div className="flex items-center gap-1">
                  {user.verified ? (
                    <Badge className="text-xs bg-green-100 text-green-700 border-0 px-1.5 py-0">✓ Verified</Badge>
                  ) : (
                    <Badge className="text-xs bg-yellow-100 text-yellow-700 border-0 px-1.5 py-0">Face Verify</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Profile</span>
                <span>{user.profileCompletion}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D70040] to-pink-500 rounded-full transition-all"
                  style={{ width: `${user.profileCompletion}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-3 mt-2 space-y-1 overflow-y-auto">
          {allNavItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${active
                  ? 'bg-[#D70040] text-white shadow-md shadow-[#D70040]/30'
                  : 'text-gray-600 hover:bg-[#FFE5EC] hover:text-[#D70040]'
                  }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-[#D70040]' : 'bg-[#D70040] text-white'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-20 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#D70040] fill-[#D70040]" />
            <span className="text-xl font-bold text-[#D70040]">Rishtaai</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D70040] rounded-full" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:hidden fixed inset-0 z-30"
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b">
              <Link to="/" className="flex items-center gap-2">
                <Heart className="w-7 h-7 text-[#D70040] fill-[#D70040]" />
                <span className="text-xl font-bold text-[#D70040]">Rishtaai</span>
              </Link>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {allNavItems.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-[#D70040] text-white' : 'text-gray-600 hover:bg-[#FFE5EC] hover:text-[#D70040]'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-[#D70040] text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 shadow-lg">
        <div className="flex justify-around py-2">
          {allNavItems.slice(0, 5).map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all relative ${active ? 'text-[#D70040]' : 'text-gray-400'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                {item.badge && (
                  <span className="absolute -top-0.5 right-0 w-4 h-4 bg-[#D70040] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
