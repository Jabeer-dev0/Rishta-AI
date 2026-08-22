import { Link } from 'react-router';
import { Heart, Sparkles, Shield, MessageCircle, Users, Brain } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-2xl font-bold text-primary">Rishta AI</span>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-primary hover:text-primary/80 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-pink-600 to-red-600 bg-clip-text text-transparent">
            Find Your Perfect Match with AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of matchmaking with intelligent AI that understands your heart, values, and dreams
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/signup"
              className="px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Get Started Free
            </Link>
            <button className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-full hover:bg-primary/5 transition-all text-lg">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="bg-gradient-to-br from-primary/20 to-pink-200 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">
            <div className="bg-white rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-24 h-24 text-primary mx-auto mb-4 fill-primary/20" />
                <p className="text-gray-500">AI-Powered Matchmaking Platform</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Choose <span className="text-primary">Rishta AI</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">AI-Powered Matching</h3>
            <p className="text-gray-600">
              Our advanced AI analyzes compatibility across multiple dimensions to find your perfect match
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Verified Profiles</h3>
            <p className="text-gray-600">
              All profiles are verified to ensure authenticity and safety for our community
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Smart Communication</h3>
            <p className="text-gray-600">
              AI-assisted chat helps you connect meaningfully with suggested conversation starters
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Compatibility Insights</h3>
            <p className="text-gray-600">
              Get detailed compatibility reports and relationship forecasts powered by AI
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Family Compatibility</h3>
            <p className="text-gray-600">
              Understand family dynamics and cultural compatibility for lasting relationships
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Relationship Support</h3>
            <p className="text-gray-600">
              Access to AI relationship counselor and ongoing support for your journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of happy couples who found love with Rishta AI</p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-primary rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl text-lg"
          >
            Start Your Journey Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 border-t">
        <p>&copy; 2026 Rishta AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
