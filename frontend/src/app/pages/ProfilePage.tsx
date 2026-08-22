import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  User, MapPin, Briefcase, GraduationCap, Heart, Shield,
  Edit, Camera, Star, Clock, Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import { ApiStats } from '../types/api';
import { Link } from 'react-router';
import { Avatar } from '../components/Avatar';
import { useRef } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'preferences'>('about');
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profileApi.stats().then(res => { if (res.success) setStats(res.data); });
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading photo...');

    try {
      const res = await profileApi.uploadPhoto(file);
      if (res.success) {
        // Update user context with new profilePhoto
        updateUser({ profilePhoto: res.data.profilePhoto });
        toast.success('Profile photo updated!', { id: toastId });
      } else {
        toast.error(res.message || 'Failed to upload photo', { id: toastId });
      }
    } catch (err) {
      toast.error('Error uploading photo. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  const statCards = [
    { label: 'Profile Views', value: stats?.profileViews ?? '—', icon: Eye },
    { label: 'AI Matches', value: stats?.aiMatches ?? '—', icon: Heart },
    { label: 'Pending', value: stats?.pendingRequests ?? '—', icon: Clock },
    { label: 'AI Score', value: user.aiScore ?? '—', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6"
        >
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-[#D70040] via-pink-500 to-rose-400 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            <Link
              to="/app/profile/edit"
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-all"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Profile
            </Link>
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                <Avatar 
                  src={user.profilePhoto} 
                  name={user.name} 
                  size="2xl" 
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#D70040] rounded-full flex items-center justify-center text-white shadow border-2 border-white hover:bg-[#B00034] transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>
              <div className="flex gap-2 mb-1">
                {user.verified ? (
                  <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Identity Verified
                  </Badge>
                ) : (
                  <Link to="/app/settings">
                    <Badge className="bg-yellow-100 text-yellow-700 border-0 cursor-pointer">
                      ⚠ Verify Identity
                    </Badge>
                  </Link>
                )}
              </div>
            </div>

            {/* Name & Info */}
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.city}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{user.profession}</span>
              <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{user.education}</span>
            </div>

            {/* Profile Completion */}
            <div className="mt-4 p-3 bg-gradient-to-r from-[#D70040]/5 to-[#FFE5EC] rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-[#D70040]">{user.profileCompletion}%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${user.profileCompletion}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-[#D70040] to-pink-500 rounded-full"
                />
              </div>
              {user.profileCompletion < 100 && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Complete your profile to get {100 - user.profileCompletion}% more visibility
                </p>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="text-center bg-gray-50 rounded-2xl p-3"
                >
                  <stat.icon className="w-5 h-5 text-[#D70040] mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-5">
          {(['about', 'preferences'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[#D70040] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'about' ? '👤 About Me' : '❤️ Partner Preferences'}
            </button>
          ))}
        </div>

        {activeTab === 'about' ? (
          <motion.div
            key="about"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#D70040]" /> About Me
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {user.bio || 'Add a bio to tell others about yourself...'}
              </p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Personal Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Age', value: `${user.age} years` },
                  { label: 'Star (Zodiac)', value: (user as any).zodiacSign || '—' },
                  { label: 'Gender', value: user.gender },
                  { label: 'Religion', value: user.religion },
                  { label: 'City', value: user.city },
                  { label: 'Education', value: user.education },
                  { label: 'Profession', value: user.profession },
                ].map(detail => (
                  <div key={detail.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{detail.label}</span>
                    <span className="text-sm font-semibold text-gray-800">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">Interests & Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map(interest => (
                  <span key={interest} className="bg-[#FFE5EC] text-[#D70040] text-sm px-3 py-1.5 rounded-full font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
          >
            <h3 className="font-bold text-gray-800 mb-2">What You're Looking For</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Age Range</p>
                <p className="font-semibold text-gray-800">
                  {(user as any).partnerPreferences?.ageRange?.min ?? (user as any).partnerPreferences?.ageRange?.[0] ?? '—'}
                  {' – '}
                  {(user as any).partnerPreferences?.ageRange?.max ?? (user as any).partnerPreferences?.ageRange?.[1] ?? '—'} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Preferred Cities</p>
                <div className="flex flex-wrap gap-2">
                  {user.partnerPreferences.cities.length > 0
                    ? user.partnerPreferences.cities.map(c => (
                        <span key={c} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{c}</span>
                      ))
                    : <span className="text-gray-400 text-sm">Not specified</span>
                  }
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Education Level</p>
                <div className="flex flex-wrap gap-2">
                  {user.partnerPreferences.education.map(e => (
                    <span key={e} className="bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full">{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Religion</p>
                <div className="flex flex-wrap gap-2">
                  {user.partnerPreferences.religions.map(r => (
                    <span key={r} className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">{r}</span>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/app/profile/edit">
              <Button className="w-full mt-2 bg-[#D70040] hover:bg-[#B00034] text-white gap-2">
                <Edit className="w-4 h-4" /> Update Preferences
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
