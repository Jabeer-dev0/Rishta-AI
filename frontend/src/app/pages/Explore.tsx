import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, X, MapPin, Briefcase, GraduationCap, Filter, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from '../components/Navigation';

export default function Explore() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const profiles = [
    {
      id: 1,
      name: 'Sarah Ahmed',
      age: 26,
      city: 'New York',
      profession: 'Doctor',
      education: 'MBBS, MD',
      interests: ['Reading', 'Traveling', 'Cooking'],
      bio: 'Looking for someone who values family and has a good sense of humor. Love exploring new cuisines and traveling.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
      compatibility: 92,
    },
    {
      id: 2,
      name: 'Fatima Khan',
      age: 24,
      city: 'London',
      profession: 'Software Engineer',
      education: 'B.Tech CS',
      interests: ['Technology', 'Photography', 'Hiking'],
      bio: 'Tech enthusiast who loves nature and photography. Looking for someone ambitious and kind-hearted.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
      compatibility: 88,
    },
    {
      id: 3,
      name: 'Aisha Malik',
      age: 27,
      city: 'Dubai',
      profession: 'Teacher',
      education: 'Masters in Education',
      interests: ['Teaching', 'Art', 'Music'],
      bio: 'Passionate educator who believes in making a difference. Love art, music, and meaningful conversations.',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
      compatibility: 85,
    },
    {
      id: 4,
      name: 'Zara Hassan',
      age: 25,
      city: 'Toronto',
      profession: 'Architect',
      education: 'B.Arch',
      interests: ['Design', 'Travel', 'Coffee'],
      bio: 'Creative soul with a passion for design and architecture. Looking for someone who appreciates beauty in everyday life.',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
      compatibility: 90,
    },
  ];

  const currentProfile = profiles[currentIndex];

  const handleLike = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePass = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 pb-20 md:pb-0">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Explore Matches</h1>
            <p className="text-gray-600">Find your perfect match</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="font-bold mb-4">Filter Preferences</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">Age Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-2 bg-gray-50 rounded-lg border" />
                  <input type="number" placeholder="Max" className="w-full px-3 py-2 bg-gray-50 rounded-lg border" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">City</label>
                <input type="text" placeholder="Enter city" className="w-full px-3 py-2 bg-gray-50 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm mb-2">Education</label>
                <select className="w-full px-3 py-2 bg-gray-50 rounded-lg border">
                  <option>Any</option>
                  <option>High School</option>
                  <option>Bachelor's</option>
                  <option>Master's</option>
                  <option>PhD</option>
                </select>
              </div>
            </div>
            <button className="mt-4 px-6 py-2 bg-primary text-white rounded-full">
              Apply Filters
            </button>
          </motion.div>
        )}

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProfile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-96 md:h-[500px]">
                <img
                  src={currentProfile.image}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-bold text-primary">{currentProfile.compatibility}% Match</span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold mb-2">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {currentProfile.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {currentProfile.profession}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {currentProfile.education}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{currentProfile.bio}</p>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handlePass}
                    className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl"
                  >
                    <X className="w-8 h-8 text-gray-600" />
                  </button>
                  <Link
                    to={`/profile`}
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Info className="w-8 h-8 text-blue-600" />
                  </Link>
                  <button
                    onClick={handleLike}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6 flex justify-center gap-2">
                  {profiles.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
