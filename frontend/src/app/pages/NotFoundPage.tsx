import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Heart, Home, Search } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE5EC] via-white to-pink-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mb-6"
        >
          <Heart className="w-20 h-20 text-[#D70040] fill-[#D70040] mx-auto opacity-30" />
        </motion.div>
        <h1 className="text-8xl font-black text-[#D70040] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Oops! This page doesn't exist. Let's get you back to finding your perfect match.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#D70040] hover:bg-[#B00034] text-white gap-2"
          >
            <Home className="w-4 h-4" /> Go Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/app/explore')}
            className="border-[#D70040] text-[#D70040] hover:bg-[#FFE5EC] gap-2"
          >
            <Search className="w-4 h-4" /> Explore
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
