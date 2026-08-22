import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, MapPin, Briefcase, GraduationCap, Heart, Shield, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { matchApi, connectionApi } from '../services/api';
import { ApiUser } from '../types/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Avatar } from '../components/Avatar';

const avatarColors = ['#D70040', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777'];

interface Filters { search: string; city: string; minAge: string; maxAge: string; religion: string; }

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ search: '', city: '', minAge: '', maxAge: '', religion: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [connecting, setConnecting] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = useCallback(async (p = page, f = filters) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: 9 };
      if (f.search) params.search = f.search;
      if (f.city) params.city = f.city;
      if (f.minAge) params.minAge = f.minAge;
      if (f.maxAge) params.maxAge = f.maxAge;
      if (f.religion) params.religion = f.religion;

      const res = await matchApi.explore(params);
      if (res.success) {
        setProfiles(res.data?.profiles || []);
        setTotalPages(res.data?.pagination?.pages || 1);
        setTotal(res.data?.pagination?.total || 0);
      }
    } catch {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(1, filters); }, []);

  const handleSearch = () => { setPage(1); load(1, filters); };

  const handleConnect = async (userId: string, name: string) => {
    setConnecting(userId);
    try {
      const res = await connectionApi.send(userId);
      if (res.success) {
        toast.success(`Connection request sent to ${name}!`);
        // Update local state to show "Request Sent"
        setProfiles(prev => prev.map(p => 
          p._id === userId ? { ...p, connectionStatus: 'pending_sent' } : p
        ));
      } else {
        toast.error(res.message || 'Could not send request');
      }
    } catch {
      toast.error('Failed to send connection request');
    } finally {
      setConnecting(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    load(newPage, filters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Explore Profiles</h1>
          <p className="text-gray-500 text-sm mt-1">{loading ? 'Loading...' : `${total} profiles found`}</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D70040] focus:outline-none text-sm"
                placeholder="Search by name, profession, or city..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#D70040] hover:text-[#D70040] transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <Button onClick={handleSearch} className="bg-[#D70040] hover:bg-[#B00034] text-white px-5 rounded-xl text-sm">Search</Button>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
              {[
                { key: 'city', placeholder: 'City', icon: MapPin },
                { key: 'religion', placeholder: 'Religion', icon: Heart },
                { key: 'minAge', placeholder: 'Min Age', icon: null },
                { key: 'maxAge', placeholder: 'Max Age', icon: null },
              ].map(({ key, placeholder }) => (
                <input key={key} placeholder={placeholder} type={key.includes('Age') ? 'number' : 'text'}
                  className="px-3 py-2 rounded-xl border border-gray-200 focus:border-[#D70040] focus:outline-none text-sm"
                  value={(filters as any)[key]}
                  onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md animate-pulse h-72" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No profiles found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((profile, i) => (
              <motion.div key={profile._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
                <div className="relative h-40 flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/app/profile/${profile._id}`)}
                  style={{ background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}22, ${avatarColors[(i + 1) % avatarColors.length]}22)` }}>
                  <Avatar 
                    src={profile.profilePhoto} 
                    name={profile.name} 
                    size="2xl" 
                    className="border-4 border-white shadow-lg"
                  />
                  {profile.verified && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Verified
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 cursor-pointer hover:text-[#D70040] transition-colors"
                    onClick={() => navigate(`/app/profile/${profile._id}`)}>
                    {profile.name}, {profile.age}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" /> {profile.city}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {profile.profession}</span>
                    <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {profile.education?.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  {profile.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.interests.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] bg-pink-50 text-[#D70040] px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  {profile.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{profile.bio}</p>}
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => navigate(`/app/profile/${profile._id}`)}
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" /> View Profile
                    </button>
                    <button
                      onClick={() => handleConnect(profile._id, profile.name)}
                      disabled={connecting === profile._id || profile.connectionStatus !== 'none'}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                        profile.connectionStatus === 'pending_sent' 
                          ? 'bg-gray-100 text-gray-500 cursor-default'
                          : profile.connectionStatus === 'pending_received'
                          ? 'bg-rose-100 text-[#D70040]'
                          : profile.connectionStatus === 'accepted'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-[#D70040] text-white hover:bg-[#B00034]'
                      } disabled:opacity-60`}>
                      {connecting === profile._id ? (
                        'Sending...'
                      ) : profile.connectionStatus === 'pending_sent' ? (
                        <>Request Sent</>
                      ) : profile.connectionStatus === 'pending_received' ? (
                        <>Accept Request</>
                      ) : profile.connectionStatus === 'accepted' ? (
                        <>Connected</>
                      ) : (
                        <><Heart className="w-3.5 h-3.5" /> Connect</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
              className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-[#D70040] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}
              className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-[#D70040] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
