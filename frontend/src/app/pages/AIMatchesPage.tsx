import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Briefcase, Shield, Heart, BarChart3, X, RefreshCw, Loader2, User as UserIcon, Stars } from 'lucide-react';
import { useNavigate } from 'react-router';
import { matchApi, connectionApi, aiApi } from '../services/api';
import { ApiMatch } from '../types/api';
import { toast } from 'sonner';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui/button';

const avatarColors = ['#D70040', '#7c3aed', '#0891b2', '#059669', '#d97706'];

export default function AIMatchesPage() {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ApiMatch | null>(null);
  const [selectedStarInsight, setSelectedStarInsight] = useState<{ match: ApiMatch, insight: string } | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [starLoading, setStarLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const matchRes = await matchApi.getMyMatches();
      if (matchRes.success) setMatches(matchRes.data?.matches || []);
    } catch { toast.error('Failed to load matches'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await matchApi.regenerate();
      if (res.success) { setMatches(res.data?.matches || []); toast.success('Matches regenerated!'); }
    } catch { toast.error('Failed to regenerate matches'); }
    finally { setRegenerating(false); }
  };

  const handleAIReport = async (match: ApiMatch) => {
    setSelectedReport(match);
    if (!match.report) {
      setReportLoading(true);
      try {
        const res = await aiApi.generateReport(match.matchedUser._id);
        if (res.success) {
          setMatches(prev => prev.map(m => m._id === match._id ? { ...m, ...res.data?.report, report: res.data?.report?.reportText || res.data?.report?.report } : m));
          setSelectedReport(m => m ? { ...m, ...res.data?.report } : m);
        } else toast.error(res.message || 'Could not generate report');
      } catch { toast.error('Failed to generate AI report'); }
      finally { setReportLoading(false); }
    }
  };

  const handleStarInsight = async (match: ApiMatch) => {
    if (match.aiInsights?.starInsight) {
      setSelectedStarInsight({ match, insight: match.aiInsights.starInsight });
      return;
    }

    setStarLoading(true);
    try {
      const res = await aiApi.getStarInsight(match.matchedUser._id);
      if (res.success) {
        const insight = res.data.insight;
        setMatches(prev => prev.map(m => m._id === match._id ? { 
          ...m, 
          aiInsights: { ...(m.aiInsights || {}), starInsight: insight } 
        } : m));
        setSelectedStarInsight({ match, insight });
      } else {
        toast.error(res.message || 'Could not fetch star insight');
      }
    } catch {
      toast.error('Failed to fetch star insight');
    } finally {
      setStarLoading(false);
    }
  };

  const handleConnect = async (match: ApiMatch) => {
    setConnecting(match._id);
    try {
      const res = await connectionApi.send(match.matchedUser._id);
      if (res.success) {
        toast.success(`Request sent to ${match.matchedUser.name}!`);
        setMatches(prev => prev.map(m => 
          m._id === match._id ? { ...m, matchedUser: { ...m.matchedUser, connectionStatus: 'pending_sent' } } : m
        ));
      } else {
        toast.error(res.message || 'Could not send request');
      }
    } catch { toast.error('Failed to send request'); }
    finally { setConnecting(null); }
  };

  const scoreColor = (s: number) => s >= 85 ? '#059669' : s >= 70 ? '#d97706' : '#D70040';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D70040] to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Matches</h1>
              <p className="text-sm text-gray-500">Curated by our compatibility engine • Updated daily</p>
            </div>
          </div>
          <button onClick={handleRegenerate} disabled={regenerating}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#D70040] hover:text-[#D70040] transition-colors disabled:opacity-60">
            {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md h-32 animate-pulse" />
          ))}</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-semibold text-gray-600">No matches yet</p>
            <p className="text-sm text-gray-400 mt-1">Complete your profile and personality test to get AI matches</p>
            <button onClick={handleRegenerate} className="mt-4 bg-[#D70040] text-white px-6 py-2.5 rounded-xl text-sm hover:bg-[#B00034] transition-colors">
              Generate Matches
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, i) => {
              if (!match.matchedUser) return null; // Skip if user was deleted
              
              const status = match.matchedUser?.connectionStatus || 'none';
              const isSent = status === 'pending_sent';
              const isReceived = status === 'pending_received';
              const isConnected = status === 'accepted';
              return (
                <motion.div key={match._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/app/profile/${match.matchedUser._id}`)}>
                      <Avatar 
                        src={match.matchedUser?.profilePhoto} 
                        name={match.matchedUser?.name} 
                        size="xl" 
                        className="rounded-2xl"
                      />
                      {match.matchedUser?.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 cursor-pointer hover:text-[#D70040] transition-colors"
                            onClick={() => navigate(`/app/profile/${match.matchedUser._id}`)}>
                            {match.matchedUser?.name}, {match.matchedUser?.age}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{match.matchedUser?.profession}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.matchedUser?.city}</span>
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <div className="relative w-14 h-14">
                            <svg className="w-14 h-14 -rotate-90">
                              <circle cx="28" cy="28" r="22" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                              <circle cx="28" cy="28" r="22" fill="none" stroke={scoreColor(match.compatibilityScore)}
                                strokeWidth="5" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 22}`}
                                strokeDashoffset={`${2 * Math.PI * 22 * (1 - match.compatibilityScore / 100)}`} />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black"
                              style={{ color: scoreColor(match.compatibilityScore) }}>
                              {match.compatibilityScore}%
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">Match</p>
                        </div>
                      </div>

                      {match.matchReasons?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {match.matchReasons.slice(0, 2).map((r, ri) => (
                            <span key={ri} className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              ✓ {r}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleAIReport(match)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-[#D70040] hover:text-[#D70040] transition-colors">
                          <BarChart3 className="w-3.5 h-3.5" /> AI Report
                        </button>
                        <button onClick={() => handleStarInsight(match)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-[#D70040] hover:text-[#D70040] transition-colors">
                          <Stars className="w-3.5 h-3.5 text-amber-500" /> Star Insight
                        </button>
                        <button 
                          onClick={() => handleConnect(match)} 
                          disabled={connecting === match._id || status !== 'none'}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
                            isSent 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : isReceived
                              ? 'bg-rose-100 text-[#D70040]'
                              : isConnected
                              ? 'bg-green-100 text-green-600'
                              : 'bg-[#D70040] text-white hover:bg-[#B00034]'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${(isSent || isConnected) ? 'fill-current' : ''}`} />
                          {connecting === match._id ? 'Sending...' : 
                           isSent ? 'Request Sent' : 
                           isReceived ? 'Accept Request' : 
                           isConnected ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-900">AI Compatibility Report</h2>
                <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reportLoading ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 text-[#D70040] animate-spin" />
                  <p className="text-sm text-gray-500">Generating AI report...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-5 p-3 bg-pink-50 rounded-xl">
                    <Avatar 
                      src={selectedReport.matchedUser?.profilePhoto} 
                      name={selectedReport.matchedUser?.name} 
                      size="md" 
                      className="rounded-xl"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedReport.matchedUser?.name}</p>
                      <p className="text-sm text-[#D70040] font-bold">{selectedReport.compatibilityScore}% compatible</p>
                    </div>
                  </div>

                  {[
                    { label: 'Personality Match', val: selectedReport.aiInsights?.personalityMatch },
                    { label: 'Lifestyle Compatibility', val: selectedReport.aiInsights?.lifestyleCompatibility },
                    { label: 'Emotional Compatibility', val: selectedReport.aiInsights?.emotionalCompatibility },
                    { label: 'Long-term Stability', val: selectedReport.aiInsights?.longTermStability },
                  ].map(({ label, val }) => val != null && (
                    <div key={label} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold" style={{ color: scoreColor(val) }}>{val}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }}
                          className="h-full rounded-full" style={{ backgroundColor: scoreColor(val) }} />
                      </div>
                    </div>
                  ))}

                  {selectedReport.aiInsights?.strengths?.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold text-sm text-gray-900 mb-2">✅ Strengths</p>
                      {selectedReport.aiInsights.strengths.map((s, i) => (
                        <p key={i} className="text-xs text-gray-600 mb-1">• {s}</p>
                      ))}
                    </div>
                  )}

                  {selectedReport.aiInsights?.potentialHurdles?.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-sm text-gray-900 mb-2">⚠️ Consider</p>
                      {selectedReport.aiInsights.potentialHurdles.map((h, i) => (
                        <p key={i} className="text-xs text-gray-600 mb-1">• {h}</p>
                      ))}
                    </div>
                  )}

                  {selectedReport.report && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-semibold text-gray-700 mb-1">AI Analysis</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{selectedReport.report}</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star Insight Modal */}
      <AnimatePresence>
        {(selectedStarInsight || starLoading) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedStarInsight(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1a1a2e] text-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
              
              {/* Celestial Header */}
              <div className="relative h-32 bg-gradient-to-b from-[#2e1065] to-[#1a1a2e] flex items-center justify-center">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute">
                  <Stars className="w-20 h-20 text-amber-200/20" />
                </motion.div>
                <Stars className="w-12 h-12 text-amber-300 relative z-10 drop-shadow-[0_0_15px_rgba(252,211,77,0.5)]" />
              </div>

              <div className="p-8 text-center">
                <h2 className="text-2xl font-black mb-1 bg-gradient-to-r from-amber-200 to-rose-300 bg-clip-text text-transparent">Celestial Insight</h2>
                <p className="text-gray-400 text-sm mb-6">Star compatibility between you & {selectedStarInsight?.match.matchedUser.name}</p>

                {starLoading ? (
                  <div className="py-10 space-y-4">
                    <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
                    <p className="text-amber-200/70 text-sm font-medium animate-pulse">Consulting the stars...</p>
                  </div>
                ) : (
                  <>
                    <div className="relative p-6 bg-white/5 rounded-2xl border border-white/10 mb-8 italic text-lg leading-relaxed text-gray-200">
                      <span className="absolute -top-4 -left-2 text-6xl text-amber-300/20 font-serif">"</span>
                      {selectedStarInsight?.insight}
                      <span className="absolute -bottom-10 -right-2 text-6xl text-amber-300/20 font-serif rotate-180">"</span>
                    </div>

                    <Button onClick={() => setSelectedStarInsight(null)} 
                      className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white py-6 rounded-2xl font-bold shadow-lg shadow-rose-500/20">
                      Close Insight
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
