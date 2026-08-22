import { useState } from 'react';
import { Camera, MapPin, Briefcase, GraduationCap, Heart, Shield, Edit, Check } from 'lucide-react';
import { motion } from 'motion/react';
import Navigation from '../components/Navigation';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    age: 28,
    city: 'New York',
    profession: 'Software Engineer',
    education: 'Masters in Computer Science',
    bio: 'Tech enthusiast who loves exploring new places and trying different cuisines. Looking for someone who values family, has a good sense of humor, and enjoys meaningful conversations.',
    interests: ['Technology', 'Travel', 'Cooking', 'Reading', 'Photography'],
    familyBackground: 'Close-knit family with traditional values. Parents are retired educators.',
  });

  const [preferences, setPreferences] = useState({
    ageRange: '24-32',
    city: 'New York, Los Angeles, Chicago',
    education: "Bachelor's or higher",
    profession: 'Any',
  });

  const photos = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
  ];

  const profileCompletion = 75;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 pb-20 md:pb-0">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
          >
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-primary to-pink-600 relative">
              <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-6">
                <div className="relative">
                  <img
                    src={photos[0]}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                  <div className="absolute -top-2 -right-2 bg-green-500 p-2 rounded-full border-2 border-white">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 mt-4 md:mt-16">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold mb-1">
                        {profileData.name}, {profileData.age}
                      </h1>
                      <div className="flex flex-wrap gap-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profileData.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {profileData.profession}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {profileData.education}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                    >
                      {isEditing ? (
                        <>
                          <Check className="w-4 h-4" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>

                  {/* Profile Completion */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Profile Completion</span>
                      <span className="text-primary font-bold">{profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-primary/10 px-4 py-2 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">234</div>
                      <div className="text-xs text-gray-600">Views</div>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-xs text-gray-600">Matches</div>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">5</div>
                      <div className="text-xs text-gray-600">AI Suggestions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* About Me */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">About Me</h2>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{profileData.bio}</p>
                )}
              </div>

              {/* Interests */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-full flex items-center gap-2"
                    >
                      {interest}
                      {isEditing && (
                        <button className="hover:text-primary/70">×</button>
                      )}
                    </span>
                  ))}
                  {isEditing && (
                    <button className="px-4 py-2 border-2 border-dashed border-primary/30 text-primary rounded-full hover:bg-primary/5">
                      + Add Interest
                    </button>
                  )}
                </div>
              </div>

              {/* Family Background */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Family Background</h2>
                {isEditing ? (
                  <textarea
                    value={profileData.familyBackground}
                    onChange={(e) => setProfileData({ ...profileData, familyBackground: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{profileData.familyBackground}</p>
                )}
              </div>

              {/* Photos */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="p-2 bg-white rounded-full">
                            <Camera className="w-5 h-5 text-gray-800" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Partner Preferences */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Looking For</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Age Range</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={preferences.ageRange}
                        onChange={(e) => setPreferences({ ...preferences, ageRange: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border"
                      />
                    ) : (
                      <p className="font-semibold">{preferences.ageRange}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={preferences.city}
                        onChange={(e) => setPreferences({ ...preferences, city: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border"
                      />
                    ) : (
                      <p className="font-semibold">{preferences.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Education</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={preferences.education}
                        onChange={(e) => setPreferences({ ...preferences, education: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border"
                      />
                    ) : (
                      <p className="font-semibold">{preferences.education}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Features */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
                <h3 className="font-bold mb-3">Complete Your Profile</h3>
                <div className="space-y-2 text-sm">
                  <button className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-white/80 transition-colors">
                    📝 Take Personality Test
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-white/80 transition-colors">
                    🔗 Connect Social Media
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-white/80 transition-colors">
                    🎯 Set Advanced Preferences
                  </button>
                </div>
              </div>

              {/* Verification */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold">Verification</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>Email Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>Phone Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-gray-300 rounded-full" />
                    <span className="text-gray-500">Photo Verification Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
