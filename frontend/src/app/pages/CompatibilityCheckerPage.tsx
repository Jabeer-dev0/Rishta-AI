import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Upload, 
  User, 
  Sparkles, 
  ChevronRight, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeftRight,
  Loader2,
  Copy,
  Check
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

type InputMode = 'form' | 'file';

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

const CompatibilityCheckerPage: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('form');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form Data (User A)
  const [userA, setUserA] = useState<UserData>({ ...emptyUser });

  // Direct check data (for File Mode)
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === 'A') setFileA(file);
      else setFileB(file);
    }
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiApi.createGuestSession(userA);
      if (res.success) {
        const url = `${window.location.origin}/compatibility/join/${res.data.sessionId}`;
        setSessionUrl(url);
        toast.success('Invitation link generated!');
      } else {
        toast.error(res.message || 'Failed to generate link');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileA || !fileB) return toast.error('Please upload both files');
    
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('fileA', fileA);
      formData.append('fileB', fileB);

      const response = await aiApi.checkGuestCompatibility(formData);
      if (response.success) {
        setResult(response.data);
        toast.success('Compatibility analysis complete!');
      } else {
        toast.error(response.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!sessionUrl) return;
    navigator.clipboard.writeText(sessionUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const renderForm = (data: UserData, setData: React.Dispatch<React.SetStateAction<UserData>>, title: string) => (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-rose-500/5 border border-rose-100 space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
          <User className="w-5 h-5" />
        </div>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Age</label>
          <input
            type="number"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={data.age}
            onChange={(e) => setData({ ...data, age: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Gender</label>
          <select
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={data.gender}
            onChange={(e) => setData({ ...data, gender: e.target.value })}
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
            value={data.religion}
            onChange={(e) => setData({ ...data, religion: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">City</label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Education</label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={data.education}
            onChange={(e) => setData({ ...data, education: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 ml-1">Interests & Values</label>
        <textarea
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all h-32 resize-none"
          value={data.interests}
          onChange={(e) => setData({ ...data, interests: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFE5EC]/30 text-gray-900 py-16 px-4 md:px-8">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">AI-Powered Analysis</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight">
            Compatibility <span className="text-rose-600">Checker</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Invite your partner to discover your potential for a lifelong journey together. Our AI evaluates personality, values, and lifestyle.
          </motion.p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center">
          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-[2rem] border border-rose-100 inline-flex shadow-xl shadow-rose-500/5">
            <button 
              onClick={() => { setMode('form'); setResult(null); setSessionUrl(null); }}
              className={`px-8 py-3 rounded-[1.75rem] font-bold transition-all duration-300 ${mode === 'form' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105' : 'text-gray-500 hover:text-rose-600'}`}
            >
              Shareable Link
            </button>
            <button 
              onClick={() => { setMode('file'); setResult(null); setSessionUrl(null); }}
              className={`px-8 py-3 rounded-[1.75rem] font-bold transition-all duration-300 ${mode === 'file' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105' : 'text-gray-500 hover:text-rose-600'}`}
            >
              Direct File Check
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {mode === 'form' ? (
              !sessionUrl ? (
                <motion.form key="form-input" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} onSubmit={handleGenerateLink} className="max-w-2xl mx-auto space-y-10">
                  {renderForm(userA, setUserA, 'Your Information')}
                  <div className="flex justify-center">
                    <button disabled={loading} className="px-16 py-5 bg-rose-600 text-white rounded-[2rem] font-black text-xl hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-rose-600/30 flex items-center gap-3">
                      {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Generating...</> : <><Heart className="w-6 h-6" /> Create Invitation Link <ChevronRight className="w-6 h-6" /></>}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="session-link" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-rose-500/10 border border-rose-100 text-center space-y-8">
                  <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Your link is ready!</h2>
                    <p className="text-gray-500 mt-2">Share this link with your partner to start the analysis.</p>
                  </div>
                  <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3">
                    <input readOnly value={sessionUrl} className="flex-1 bg-transparent border-none outline-none text-rose-600 font-medium px-2" />
                    <button onClick={copyToClipboard} className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-rose-600">
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 italic">This link will expire in 7 days.</p>
                </motion.div>
              )
            ) : !result ? (
              <motion.form key="file-input" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} onSubmit={handleDirectCheck} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* File A & B Upload boxes... */}
                  <div className="bg-white border-2 border-dashed border-rose-200 p-12 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 group hover:border-rose-500 transition-all cursor-pointer shadow-xl shadow-rose-500/5 relative">
                    <Upload className="w-12 h-12 text-rose-600" />
                    <div className="text-center">
                      <h3 className="text-2xl font-bold">Profile A</h3>
                      <p className="text-gray-400">{fileA ? fileA.name : 'PDF, Word, or Text'}</p>
                    </div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'A')} />
                  </div>
                  <div className="bg-white border-2 border-dashed border-rose-200 p-12 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 group hover:border-rose-500 transition-all cursor-pointer shadow-xl shadow-rose-500/5 relative">
                    <Upload className="w-12 h-12 text-rose-600" />
                    <div className="text-center">
                      <h3 className="text-2xl font-bold">Profile B</h3>
                      <p className="text-gray-400">{fileB ? fileB.name : 'PDF, Word, or Text'}</p>
                    </div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'B')} />
                  </div>
                </div>
                <div className="flex justify-center">
                  <button disabled={loading} className="px-16 py-5 bg-rose-600 text-white rounded-[2rem] font-black text-xl hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/30 flex items-center gap-3">
                    {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing...</> : <><Sparkles className="w-6 h-6" /> Analyze Now <ChevronRight className="w-6 h-6" /></>}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="bg-white border border-rose-100 rounded-[3.5rem] p-8 md:p-16 shadow-2xl shadow-rose-500/10 relative overflow-hidden">
                  <div className="absolute top-10 right-10">
                    <div className={`px-8 py-3 rounded-full border-2 text-xl font-black ${result.status === 'Completely' ? 'bg-green-50 border-green-200 text-green-600' : result.status === 'Future' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                      {result.status}
                    </div>
                  </div>
                  <div className="space-y-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                          <motion.circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={553} initial={{ strokeDashoffset: 553 }} animate={{ strokeDashoffset: 553 - (553 * result.compatibilityScore) / 100 }} className="text-rose-600" strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-5xl font-black text-gray-900">{result.compatibilityScore}%</span>
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Match</span>
                        </div>
                      </div>
                      <div className="text-center md:text-left space-y-4">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">AI Compatibility Analysis</h2>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{result.report}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-green-50/50 rounded-[2.5rem] p-10 border border-green-100">
                        <h4 className="text-green-700 text-2xl font-black mb-6 flex items-center gap-3"><CheckCircle2 className="w-7 h-7" /> Key Strengths</h4>
                        <ul className="space-y-4">
                          {result.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-gray-700 text-lg flex items-start gap-3 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-2.5 flex-shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-rose-50/50 rounded-[2.5rem] p-10 border border-rose-100">
                        <h4 className="text-rose-700 text-2xl font-black mb-6 flex items-center gap-3"><AlertCircle className="w-7 h-7" /> Potential Risks</h4>
                        <ul className="space-y-4">
                          {result.risks.map((r: string, i: number) => (
                            <li key={i} className="text-gray-700 text-lg flex items-start gap-3 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-2.5 flex-shrink-0" />{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {result.graphData && (
                      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-500/5">
                        <h4 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3"><Sparkles className="w-6 h-6 text-rose-600" /> Compatibility Breakdown</h4>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Personality', score: result.graphData.personality, color: '#6366f1' },
                                { name: 'Lifestyle', score: result.graphData.lifestyle, color: '#10b981' },
                                { name: 'Emotional', score: result.graphData.emotional, color: '#f59e0b' },
                                { name: 'Values', score: result.graphData.values, color: '#ec4899' },
                              ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <div className="flex justify-center mt-8">
                  <button onClick={() => setResult(null)} className="bg-gray-100 text-gray-600 px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all">
                    <ArrowLeftRight className="w-5 h-5" /> Start New Direct Check
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityCheckerPage;
