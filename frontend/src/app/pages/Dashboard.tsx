import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, MessageCircle, Eye, Users, Shield, Brain, RefreshCw, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { matchApi } from '../services/api';
import { connectionApi } from '../services/api';
import { profileApi } from '../services/api';
import { ApiMatch, ApiConnectionRequest, ApiStats } from '../types/api';
import { toast } from 'sonner';
import { Avatar } from '../components/Avatar';

const avatarColors = ['#D70040', '#7c3aed', '#0891b2', '#059669', '#d97706'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [requests, setRequests] = useState<ApiConnectionRequest[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, rRes, sRes] = await Promise.all([
          matchApi.getMyMatches(),
          connectionApi.getReceived(),
          profileApi.stats(),
        ]);
        if (mRes.success) setMatches(mRes.data?.matches || []);
        if (rRes.success) setRequests(rRes.data?.requests || []);
        if (sRes.success) setStats(sRes.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Profile Views', value: stats?.profileViews ?? '—', icon: Eye, color: 'bg-blue-500', change: 'total' },
    { label: 'AI Matches', value: stats?.aiMatches ?? '—', icon: Heart, color: 'bg-[#D70040]', change: 'found' },
    { label: 'Messages', value: stats?.messages ?? '—', icon: MessageCircle, color: 'bg-green-500', change: 'conversations' },
    { label: 'Requests', value: stats?.pendingRequests ?? '—', icon: Users, color: 'bg-purple-500', change: 'pending' },
  ];

  const quickActions = [
    { label: 'Take Personality Test', desc: 'Get better matches with AI insights', icon: Brain, to: '/app/personality-test', color: 'from-purple-500 to-violet-600' },
    { label: 'Connect Social Media', desc: 'Enable social analysis for better matches', icon: Users, to: '/app/social-media', color: 'from-pink-500 to-rose-600' },
    { label: 'Face Verification', desc: 'Get a verified badge with AI face matching', icon: Shield, to: '/app/settings', color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your matches today</p>
        </motion.div>

        {!user?.verified && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Shield className="w-6 h-6" />
              <div>
                <p className="font-bold">Verify your face to unlock more features</p>
                <p className="text-sm opacity-90">Verified profiles get 3x more connection requests</p>
              </div>
            </div>
            <Link to="/app/settings"
              className="bg-white text-orange-500 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors flex-shrink-0">
              Verify Now →
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {loading ? <span className="animate-pulse bg-gray-200 rounded w-8 h-6 inline-block" /> : stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {user?.role !== 'admin' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Top AI Matches</h2>
                  <Link to="/app/matches" className="text-sm text-[#D70040] font-semibold hover:underline">View All →</Link>
                </div>
                {loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                  ))}</div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No matches yet. Complete your profile to get AI matches!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.slice(0, 4).map((match, i) => (
                      <motion.div key={match._id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.07 }}
                        onClick={() => navigate(`/app/profile/${match.matchedUser._id}`)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <Avatar 
                          src={match.matchedUser?.profilePhoto} 
                          name={match.matchedUser?.name} 
                          size="lg" 
                          className="rounded-xl"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {match.matchedUser?.name}, {match.matchedUser?.age}
                            </p>
                            {match.matchedUser?.verified && <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {match.matchedUser?.profession} · {match.matchedUser?.city}
                          </p>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <p className="text-lg font-black text-[#D70040]">{match.compatibilityScore}%</p>
                          <p className="text-[10px] text-gray-400">match</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/app/profile/${match.matchedUser._id}`); }}
                          className="opacity-0 group-hover:opacity-100 bg-[#D70040] text-white text-xs px-3 py-1.5 rounded-full flex-shrink-0 transition-all">
                          View
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
                <Link to="/app/explore"
                  className="flex items-center justify-center gap-2 mt-4 py-3 bg-[#FFE5EC] text-[#D70040] rounded-xl font-semibold text-sm hover:bg-[#ffd0dc] transition-colors">
                  <Compass className="w-4 h-4" /> Explore More Profiles
                </Link>
              </motion.div>
            )}

            {user?.role === 'admin' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-[2.5rem] shadow-md p-8 border border-red-50 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Platform Administration</h2>
                  <p className="text-gray-500 mb-6">You are currently logged in with full administrative privileges. Use the command center to manage users and verifications.</p>
                  <Link to="/app/admin" className="inline-flex items-center gap-2 bg-[#D70040] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#B00034] transition-all shadow-lg shadow-red-200">
                    <Shield className="w-5 h-5" /> Go to Admin Panel
                  </Link>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12">
                  <Shield className="w-64 h-64 text-[#D70040]" />
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            {requests.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Connection Requests</h2>
                  <span className="bg-[#D70040] text-white text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
                </div>
                <div className="space-y-3">
                  {requests.map((req, i) => (
                    <div key={req._id} className="flex items-center gap-3 p-3 bg-[#FFE5EC] rounded-xl">
                      <Avatar 
                        src={req.fromUser?.profilePhoto} 
                        name={req.fromUser?.name} 
                        size="md" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{req.fromUser?.name}</p>
                        <p className="text-xs text-gray-500">{req.fromUser?.city}</p>
                      </div>
                      <Link to="/app/messages"
                        className="text-xs bg-[#D70040] text-white px-2.5 py-1.5 rounded-lg font-medium flex-shrink-0">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {user?.role !== 'admin' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-md p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Complete Your Profile</h2>
                <div className="space-y-3">
                  {quickActions.map((action, i) => (
                    <Link key={i} to={action.to}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className={`bg-gradient-to-br ${action.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{action.label}</p>
                        <p className="text-xs text-gray-500 truncate">{action.desc}</p>
                      </div>
                      <span className="text-gray-300 group-hover:text-[#D70040] transition-colors">→</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
        </div>
      </div>
    </div>
  </div>
);
}
