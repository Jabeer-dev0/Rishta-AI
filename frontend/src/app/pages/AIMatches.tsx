import { useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Heart, TrendingUp, Users, Brain, AlertCircle, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navigation from '../components/Navigation';

export default function AIMatches() {
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const matches = [
    {
      id: 1,
      name: 'Sarah Ahmed',
      age: 26,
      profession: 'Doctor',
      city: 'New York',
      compatibility: 92,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      compatibility_breakdown: {
        personality: 95,
        values: 90,
        lifestyle: 88,
        interests: 94,
        communication: 92,
      },
      why_match: 'Both value family, have similar educational backgrounds, and share interests in travel and culture.',
      strengths: ['Excellent communication compatibility', 'Shared values and life goals', 'Complementary personalities'],
      potential_challenges: ['Different work schedules may require planning'],
      ai_prediction: 'Very high long-term compatibility. Strong foundation for a lasting relationship.',
    },
    {
      id: 2,
      name: 'Fatima Khan',
      age: 24,
      profession: 'Software Engineer',
      city: 'London',
      compatibility: 88,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      compatibility_breakdown: {
        personality: 90,
        values: 85,
        lifestyle: 88,
        interests: 86,
        communication: 90,
      },
      why_match: 'Tech-savvy professionals with shared interests in innovation and personal growth.',
      strengths: ['Similar career ambitions', 'Strong intellectual connection', 'Compatible life pace'],
      potential_challenges: ['May need to balance work and personal life'],
      ai_prediction: 'High compatibility with excellent growth potential together.',
    },
    {
      id: 3,
      name: 'Aisha Malik',
      age: 27,
      profession: 'Teacher',
      city: 'Dubai',
      compatibility: 85,
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
      compatibility_breakdown: {
        personality: 88,
        values: 92,
        lifestyle: 80,
        interests: 82,
        communication: 85,
      },
      why_match: 'Shared values in education, family, and cultural traditions.',
      strengths: ['Deep value alignment', 'Nurturing personalities', 'Family-oriented mindset'],
      potential_challenges: ['Different social preferences may need compromise'],
      ai_prediction: 'Strong values-based compatibility ideal for long-term commitment.',
    },
    {
      id: 4,
      name: 'Zara Hassan',
      age: 25,
      profession: 'Architect',
      city: 'Toronto',
      compatibility: 90,
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200',
      compatibility_breakdown: {
        personality: 92,
        values: 88,
        lifestyle: 91,
        interests: 89,
        communication: 90,
      },
      why_match: 'Creative minds with appreciation for beauty, culture, and meaningful experiences.',
      strengths: ['Creative synergy', 'Balanced lifestyle preferences', 'Strong emotional intelligence'],
      potential_challenges: ['May need to manage creative differences constructively'],
      ai_prediction: 'Exceptional creative and emotional compatibility.',
    },
    {
      id: 5,
      name: 'Noor Syed',
      age: 28,
      profession: 'Marketing Manager',
      city: 'Mumbai',
      compatibility: 87,
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      compatibility_breakdown: {
        personality: 89,
        values: 86,
        lifestyle: 87,
        interests: 85,
        communication: 88,
      },
      why_match: 'Dynamic professionals with strong communication skills and social awareness.',
      strengths: ['Excellent social compatibility', 'Strong communication', 'Aligned life goals'],
      potential_challenges: ['Both have busy careers - time management important'],
      ai_prediction: 'Well-balanced compatibility with strong relationship potential.',
    },
  ];

  const selectedMatchData = selectedMatch !== null ? matches.find(m => m.id === selectedMatch) : null;

  const COLORS = ['#D70040', '#ff6b9d', '#ffd4d4', '#ffa07a', '#ffb347'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 pb-20 md:pb-0">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-pink-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">AI Smart Matches</h1>
          </div>
          <p className="text-gray-600">Powered by advanced compatibility analysis</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Matches List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Top Matches</h2>
              <div className="space-y-3">
                {matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedMatch(match.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedMatch === match.id
                        ? 'bg-gradient-to-r from-primary/10 to-pink-50 border-2 border-primary'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={match.image}
                        alt={match.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{match.name}, {match.age}</h3>
                        <p className="text-sm text-gray-600">{match.profession}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{match.compatibility}%</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div className="lg:col-span-2">
            {selectedMatchData ? (
              <motion.div
                key={selectedMatchData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative h-64">
                    <img
                      src={selectedMatchData.image}
                      alt={selectedMatchData.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                      <h2 className="text-3xl font-bold mb-1">
                        {selectedMatchData.name}, {selectedMatchData.age}
                      </h2>
                      <p className="text-lg">{selectedMatchData.profession} • {selectedMatchData.city}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 p-4 bg-gradient-to-r from-primary/10 to-pink-50 rounded-xl">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Overall Compatibility: </span>
                      <span className="text-2xl font-bold text-primary">{selectedMatchData.compatibility}%</span>
                    </div>

                    <div className="flex gap-4">
                      <Link
                        to="/chat"
                        className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Start Chat
                      </Link>
                      <button className="flex-1 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                        <Heart className="w-5 h-5" />
                        Like
                      </button>
                    </div>
                  </div>
                </div>

                {/* Why This Match */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">Why This Match?</h3>
                  </div>
                  <p className="text-gray-700">{selectedMatchData.why_match}</p>
                </div>

                {/* Compatibility Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-6">Compatibility Breakdown</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          innerRadius="10%"
                          outerRadius="90%"
                          data={Object.entries(selectedMatchData.compatibility_breakdown).map(([key, value]) => ({
                            name: key.charAt(0).toUpperCase() + key.slice(1),
                            value: value,
                            fill: COLORS[Object.keys(selectedMatchData.compatibility_breakdown).indexOf(key)],
                          }))}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-3">
                      {Object.entries(selectedMatchData.compatibility_breakdown).map(([key, value], index) => (
                        <div key={key}>
                          <div className="flex justify-between mb-1">
                            <span className="capitalize font-medium">{key}</span>
                            <span className="font-bold" style={{ color: COLORS[index] }}>{value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${value}%`, backgroundColor: COLORS[index] }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strengths & Challenges */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-bold">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {selectedMatchData.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                      <h3 className="text-xl font-bold">Things to Consider</h3>
                    </div>
                    <ul className="space-y-2">
                      {selectedMatchData.potential_challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Prediction */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold">AI Relationship Forecast</h3>
                  </div>
                  <p className="text-gray-700">{selectedMatchData.ai_prediction}</p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Match</h3>
                <p className="text-gray-500">Click on a match to see detailed compatibility analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
