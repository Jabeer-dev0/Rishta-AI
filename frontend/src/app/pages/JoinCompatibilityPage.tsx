import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  User, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Share2
} from 'lucide-react';
import { aiApi } from '../services/api';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface UserData {
  name: string;
  age: string;
  gender: string;
  religion: string;
  city: string;
  education: string;
  profession: string;
  interests: string;
  email: string;
}

const emptyUser: UserData = {
  name: '',
  age: '',
  gender: '',
  religion: '',
  city: '',
  education: '',
  profession: '',
  interests: '',
  email: ''
};

const JoinCompatibilityPage: React.FC = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [userB, setUserB] = useState<UserData>({ ...emptyUser });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      try {
        const res = await aiApi.getGuestSession(sessionId);
        if (res.success) {
          setSessionData(res.data);
          if (res.data.status === 'completed') {
            setResult(res.data.result);
          }
        } else {
          toast.error('Session not found or expired');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const res = await aiApi.completeGuestSession(sessionId, userB);
      if (res.success) {
        setResult(res.data);
        toast.success('Compatibility analysis complete!');
      } else {
        toast.error(res.message || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7]">
      <Loader2 className="w-10 h-10 animate-spin text-rose-600" />
    </div>
  );

  if (!sessionData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF5F7] p-4 text-center">
      <AlertCircle className="w-16 h-16 text-rose-600 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900">Invitation Expired or Invalid</h1>
      <p className="text-gray-600 mt-2">The link you followed may have expired or is incorrect.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFE5EC]/30 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">AI-Powered Analysis</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900"
          >
            Check Compatibility with <span className="text-rose-600">{sessionData.personAName}</span>
          </motion.h1>
          <p className="text-gray-600 text-lg">
            {sessionData.personAName} has invited you to discover your compatibility together using our advanced AI.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onSubmit={handleSubmit}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-rose-500/10 border border-rose-100 space-y-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 border-b border-rose-50 pb-4">
                <User className="w-6 h-6 text-rose-600" />
                Tell us about yourself
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                    value={userB.name}
                    onChange={(e) => setUserB({ ...userB, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Age</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                    value={userB.age}
                    onChange={(e) => setUserB({ ...userB, age: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Gender</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all appearance-none"
                    value={userB.gender}
                    onChange={(e) => setUserB({ ...userB, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Religion</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                    value={userB.religion}
                    onChange={(e) => setUserB({ ...userB, religion: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">City</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                    value={userB.city}
                    onChange={(e) => setUserB({ ...userB, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Education</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                    value={userB.education}
                    onChange={(e) => setUserB({ ...userB, education: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Interests & Values</label>
                <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all h-32 resize-none"
                  value={userB.interests}
                  onChange={(e) => setUserB({ ...userB, interests: e.target.value })}
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto px-16 py-4 bg-rose-600 text-white rounded-[2rem] font-black text-xl hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-rose-600/30"
                >
                  {submitting ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing...</>
                  ) : (
                    <>Reveal Compatibility <ChevronRight className="w-6 h-6" /></>
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Result components (shortened version of CompatibilityCheckerPage results) */}
              <div className="bg-white border border-rose-100 rounded-[3.5rem] p-8 md:p-16 shadow-2xl shadow-rose-500/10 relative overflow-hidden">
                <div className="absolute top-10 right-10">
                  <div className={`px-8 py-3 rounded-full border-2 text-xl font-black ${
                    result.status === 'Completely' ? 'bg-green-50 border-green-200 text-green-600' :
                    result.status === 'Future' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                    'bg-rose-50 border-rose-200 text-rose-600'
                  }`}>
                    {result.status}
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                        <motion.circle
                          cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                          strokeDasharray={553} initial={{ strokeDashoffset: 553 }}
                          animate={{ strokeDashoffset: 553 - (553 * result.compatibilityScore) / 100 }}
                          className="text-rose-600" strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black text-gray-900">{result.compatibilityScore}%</span>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Match</span>
                      </div>
                    </div>
                    <div className="text-center md:text-left space-y-4">
                      <h2 className="text-4xl font-black text-gray-900 tracking-tight">AI Compatibility Analysis</h2>
                      <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                        {result.report}
                      </p>
                    </div>
                  </div>

                  {/* Graphs and Strengths/Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-green-50/50 rounded-[2.5rem] p-10 border border-green-100">
                      <h4 className="text-green-700 text-2xl font-black mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-7 h-7" /> Key Strengths
                      </h4>
                      <ul className="space-y-4">
                        {result.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-gray-700 text-lg flex items-start gap-3 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-2.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-rose-50/50 rounded-[2.5rem] p-10 border border-rose-100">
                      <h4 className="text-rose-700 text-2xl font-black mb-6 flex items-center gap-3">
                        <AlertCircle className="w-7 h-7" /> Potential Risks
                      </h4>
                      <ul className="space-y-4">
                        {result.risks.map((r: string, i: number) => (
                          <li key={i} className="text-gray-700 text-lg flex items-start gap-3 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-2.5 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Compatibility Breakdown Graph */}
                  {result.graphData && (
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-500/5">
                      <h4 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-rose-600" /> Compatibility Breakdown
                      </h4>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Personality', score: result.graphData.personality, color: '#6366f1' },
                              { name: 'Lifestyle', score: result.graphData.lifestyle, color: '#10b981' },
                              { name: 'Emotional', score: result.graphData.emotional, color: '#f59e0b' },
                              { name: 'Values', score: result.graphData.values, color: '#ec4899' },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} dy={10} />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }} />
                            <Bar dataKey="score" radius={[10, 10, 10, 10]} barSize={40}>
                              { [0,1,2,3].map((i) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#ec4899'][i]} />) }
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div className="py-10 border-t border-gray-100 text-center">
                    <div className="inline-block relative">
                      <span className="text-3xl font-black text-rose-600 italic">"{result.verdict}"</span>
                      <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-rose-200/50 -rotate-1" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JoinCompatibilityPage;
