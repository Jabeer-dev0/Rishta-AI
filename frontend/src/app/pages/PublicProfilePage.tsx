import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  User, MapPin, Briefcase, GraduationCap, Heart, Shield, 
  ArrowLeft, Star, Clock, CheckCircle2, MessageCircle
} from 'lucide-react';
import { profileApi, connectionApi } from '../services/api';
import { ApiUser } from '../types/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/Avatar';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (userId) {
      profileApi.getPublic(userId)
        .then(res => {
          if (res.success) setProfile(res.data?.user);
          else toast.error(res.message || 'Profile not found');
        })
        .catch(() => toast.error('Failed to load profile'))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  const handleConnect = async () => {
    if (!profile) return;
    setConnecting(true);
    try {
      const res = await connectionApi.send(profile._id);
      if (res.success) {
        toast.success(`Request sent to ${profile.name}!`);
        setProfile({ ...profile, connectionStatus: 'pending_sent' });
      } else {
        toast.error(res.message || 'Could not send request');
      }
    } catch {
      toast.error('Failed to send connection request');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Heart className="w-8 h-8 text-[#D70040] fill-[#D70040]" />
        </motion.div>
      </div>
    );
  }

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <p className="text-gray-500">Profile not found</p>
      <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
    </div>
  );

  const status = profile.connectionStatus || 'none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Profile Details</h1>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-rose-500/5 overflow-hidden mb-6 border border-rose-50"
        >
          <div className="h-40 bg-gradient-to-r from-[#D70040] to-pink-500 relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          </div>

          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="relative">
                <Avatar 
                  src={profile.profilePhoto} 
                  name={profile.name} 
                  size="2xl" 
                  className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl"
                />
                {profile.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 mb-2 items-end">
                <Badge className="bg-rose-50 text-[#D70040] border-rose-100 flex items-center gap-1.5 px-3 py-1">
                  <Star className="w-3.5 h-3.5 fill-[#D70040]" /> {profile.aiScore || 85}% Match
                </Badge>
                {profile.verified && (
                  <Badge className="bg-green-50 text-green-700 border-green-100 flex items-center gap-1.5 px-3 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ID Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name}, {profile.age}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#D70040]" />{profile.city}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[#D70040]" />{profile.profession}</span>
                  <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-[#D70040]" />{profile.education}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  onClick={handleConnect}
                  disabled={connecting || (status !== 'none' && status !== 'declined')}
                  className={`flex-1 h-12 rounded-2xl font-bold text-base transition-all ${
                    status === 'pending_sent' ? 'bg-gray-100 text-gray-500 cursor-default' :
                    status === 'pending_received' ? 'bg-rose-100 text-[#D70040]' :
                    status === 'accepted' ? 'bg-green-100 text-green-600 cursor-default hover:bg-green-100' :
                    status === 'declined' ? 'bg-red-50 text-red-500' :
                    'bg-[#D70040] text-white hover:bg-[#B00034] shadow-lg shadow-rose-600/20'
                  }`}
                >
                  {connecting ? 'Sending...' : 
                   status === 'pending_sent' ? 'Request Sent' : 
                   status === 'pending_received' ? 'Accept Request' : 
                   status === 'accepted' ? 'Connected' : 
                   status === 'declined' ? 'Request Declined' : 'Send Connection Request'}
                </Button>
                {status === 'accepted' && (
                  <Button onClick={() => navigate('/app/messages')} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-12 px-6 rounded-2xl shadow-sm">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-50/50">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#D70040]" /> About Me
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {profile.bio || 'This user has not added a bio yet.'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-50/50">
              <h3 className="font-bold text-gray-900 mb-4">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Religion', value: profile.religion },
                  { label: 'Education', value: profile.education },
                  { label: 'Profession', value: profile.profession },
                  { label: 'City', value: profile.city },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-50/50">
              <h3 className="font-bold text-gray-900 mb-4">Interests & Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map(tag => (
                  <span key={tag} className="bg-pink-50 text-[#D70040] text-xs px-4 py-2 rounded-xl font-bold border border-rose-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-50/50">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#D70040]" /> Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Profile Views</span>
                  <span className="text-sm font-bold text-gray-900">{profile.profileViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Match Score</span>
                  <span className="text-sm font-bold text-rose-600">{profile.aiScore || 85}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
