import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Heart, Sparkles, Shield, MessageCircle, Brain, TrendingUp, ArrowLeftRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms analyze compatibility based on personality, values, and lifestyle'
    },
    {
      icon: Heart,
      title: 'Deep Compatibility Analysis',
      description: 'Get detailed insights into emotional, lifestyle, and long-term compatibility'
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'AI-powered fake profile detection ensures authenticity and safety'
    },
    {
      icon: MessageCircle,
      title: 'Smart Messaging',
      description: 'AI assistant helps with conversation starters and detects toxic communication'
    },
    {
      icon: Sparkles,
      title: 'Personality Insights',
      description: 'Take our AI personality test for better matches and self-understanding'
    },
    {
      icon: TrendingUp,
      title: 'Success Prediction',
      description: 'Long-term stability predictions and relationship forecasts'
    },
    {
      icon: ArrowLeftRight,
      title: 'Guest Compatibility',
      description: 'Check your compatibility with anyone instantly using form data or profile documents'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFE5EC]/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-[#D70040]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Heart className="w-8 h-8 text-[#D70040] fill-[#D70040]" />
              <span className="text-2xl font-bold text-[#D70040]">Rishta AI</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Button
                variant="ghost"
                onClick={() => navigate('/compatibility-checker')}
                className="text-[#D70040] hover:bg-[#FFE5EC] hidden md:flex"
              >
                Compatibility Checker
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-[#D70040] hover:bg-[#FFE5EC]"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="bg-[#D70040] hover:bg-[#B00034] text-white"
              >
                Sign Up
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl mb-6 text-gray-900">
                Find Your Perfect Match with{' '}
                <span className="text-[#D70040]">AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Experience the future of matchmaking. Our advanced AI technology analyzes compatibility 
                across personality, lifestyle, and values to help you find your life partner.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/signup')}
                  className="bg-[#D70040] hover:bg-[#B00034] text-white text-lg px-8 py-6"
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="border-[#D70040] text-[#D70040] hover:bg-[#FFE5EC] text-lg px-8 py-6"
                >
                  Learn More
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-3xl font-bold text-[#D70040]">10K+</div>
                  <div className="text-sm text-gray-600">Happy Couples</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-3xl font-bold text-[#D70040]">94%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-3xl font-bold text-[#D70040]">50K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D70040]/20 to-[#FFE5EC] rounded-3xl blur-3xl"></div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758810410699-2dc1daec82dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGNvdXBsZSUyMHN1bnNldCUyMHNpbGhvdWV0dGV8ZW58MXx8fHwxNzcyMzczMDUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Happy couple"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4 text-gray-900">
              Why Choose <span className="text-[#D70040]">Rishta AI</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI technology goes beyond traditional matchmaking to find truly compatible partners
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#D70040]/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#FFE5EC] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-[#D70040]" />
                </div>
                <h3 className="text-xl mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#FFE5EC]/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to find your perfect match</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Profile', desc: 'Sign up and complete your detailed profile' },
              { step: '2', title: 'AI Analysis', desc: 'Our AI analyzes your personality and preferences' },
              { step: '3', title: 'Get Matches', desc: 'Receive highly compatible match suggestions' },
              { step: '4', title: 'Connect', desc: 'Start meaningful conversations and build relationships' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#D70040] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#D70040]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl mb-6 text-white">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of successful couples who found love through Rishta AI
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-white text-[#D70040] hover:bg-gray-100 text-lg px-12 py-6"
          >
            Start Your Journey Today
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-[#D70040] fill-[#D70040]" />
            <span className="text-xl font-bold">Rishta AI</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-Powered Matchmaking for Meaningful Relationships
          </p>
          <p className="text-gray-500 text-sm">
            © 2026 Rishta AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
