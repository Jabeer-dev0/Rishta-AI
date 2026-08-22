import { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, ShieldAlert, Ban, Trash2, 
  Search, Filter, CheckCircle, XCircle, MoreVertical,
  Activity, Heart, MessageSquare, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminApi } from '../services/api';
import { ApiUser } from '../types/api';
import { toast } from 'sonner';
import { ConfirmModal } from '../components/ConfirmModal';

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalMatches: number;
  activeUsers: number;
  pendingVerifications: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'pending' | 'blocked'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.listUsers({ 
          search, 
          verificationStatus: tab === 'pending' ? 'pending' : undefined,
          isBlocked: tab === 'blocked' ? 'true' : undefined
        })
      ]);

      if (statsRes.success) {
        const raw = statsRes.data;
        setStats({
          totalUsers: raw.totalUsers || 0,
          verifiedUsers: raw.verifiedUsers || 0,
          totalMatches: raw.totalMatches || 0,
          activeUsers: (raw.totalUsers || 0) - (raw.blockedUsers || 0),
          pendingVerifications: raw.pendingVerifications || 0
        });
      }
      if (usersRes.success) setUsers(usersRes.data?.users || []);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab, search]);

  const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await adminApi.verifyUser(userId, status);
      if (res.success) {
        toast.success(`User ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
        loadData();
      }
    } catch { toast.error('Action failed'); }
  };

  const handleBlockToggle = async (user: ApiUser) => {
    try {
      const res = user.isBlocked 
        ? await adminApi.unblockUser(user._id)
        : await adminApi.blockUser(user._id);
      if (res.success) {
        toast.success(`User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
        loadData();
      }
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async (userId: string) => {
    setDeleteId(userId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await adminApi.deleteUser(deleteId);
      if (res.success) {
        toast.success('User deleted');
        loadData();
      }
    } catch { toast.error('Action failed'); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-[#D70040]" />
              Admin Command Center
            </h1>
            <p className="text-gray-500 text-sm">Monitor system performance and manage user compliance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D70040]/20 w-full md:w-64 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
            { label: 'Verified Profiles', value: stats?.verifiedUsers || 0, icon: CheckCircle, color: 'green' },
            { label: 'AI Matches', value: stats?.totalMatches || 0, icon: Heart, color: 'pink' },
            { label: 'Pending Verification', value: stats?.pendingVerifications || 0, icon: ShieldAlert, color: 'orange' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900">{stat.value.toLocaleString()}</h3>
              </div>
              <stat.icon className={`absolute right-4 bottom-4 w-12 h-12 text-${stat.color}-500/10 group-hover:scale-110 transition-transform`} />
            </motion.div>
          ))}
        </div>

        {/* Main Management Area */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Users', icon: Users },
              { id: 'pending', label: 'Identity Requests', icon: ShieldAlert, count: stats?.pendingVerifications },
              { id: 'blocked', label: 'Blocked', icon: Ban },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 transition-all text-sm font-semibold whitespace-nowrap ${
                  tab === t.id 
                    ? 'border-[#D70040] text-[#D70040]' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.count ? <span className="bg-[#D70040]/10 text-[#D70040] px-2 py-0.5 rounded-full text-[10px]">{t.count}</span> : null}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verified</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {users.map((user) => (
                    <motion.tr 
                      key={user._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-gray-400 overflow-hidden">
                            {user.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.profession || 'No Profession'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.city}</p>
                        <p className="text-[10px] text-gray-400">{user.country || 'Pakistan'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase">Blocked</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.verificationStatus === 'verified' ? 'bg-green-500' :
                            user.verificationStatus === 'pending' ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'
                          }`} />
                          <span className="text-xs font-medium capitalize text-gray-700">{user.verificationStatus}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.verificationStatus === 'pending' && (
                            <>
                              <button onClick={() => handleVerify(user._id, 'verified')} title="Verify"
                                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleVerify(user._id, 'rejected')} title="Reject"
                                className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleBlockToggle(user)} title={user.isBlocked ? 'Unblock' : 'Block'}
                            className={`p-2 rounded-lg transition-colors ${user.isBlocked ? 'text-blue-600 hover:bg-blue-50' : 'text-orange-600 hover:bg-orange-50'}`}>
                            <Ban className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user._id)} title="Delete"
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <div className="text-center py-20">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No users found matching filters</p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center py-20 gap-3">
                <Activity className="w-8 h-8 text-[#D70040] animate-pulse" />
                <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Fetching encrypted data...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete User Forever?"
        message="This action is irreversible. All user data, messages, and matches will be permanently purged from our secure servers."
        confirmText="Delete Permanently"
        cancelText="Keep User"
        type="danger"
      />
    </div>
  );
}
