import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Brain, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import { personalityApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

interface Question { id: number; question: string; category: string; }

const SCALE = [
  { val: 1, label: 'Strongly Disagree' },
  { val: 2, label: 'Disagree' },
  { val: 3, label: 'Neutral' },
  { val: 4, label: 'Agree' },
  { val: 5, label: 'Strongly Agree' },
];

export default function PersonalityTestPage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Try to get existing result
        try {
          const resR = await personalityApi.getResult();
          if (resR.success && resR.data?.result) {
            setResult(resR.data.result);
          }
        } catch (err: any) {
          if (err.response?.status !== 404) {
            console.error('Error fetching result:', err);
          }
        }

        // 2. Load questions
        const resQ = await personalityApi.getQuestions();
        if (resQ.success) {
          setQuestions(resQ.data?.questions || []);
        }
      } catch (err) {
        toast.error('Failed to load personality test questions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(c => c + 1), 400);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([id, score]) => ({ questionId: parseInt(id), score }));
      const res = await personalityApi.submit(formattedAnswers);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success(`Your personality type: ${res.data.personalityType} 🧠`);
      } else toast.error(res.message || 'Submission failed');
    } catch { toast.error('Failed to submit answers'); }
    finally { setSubmitting(false); }
  };

  const progress = Math.round((Object.keys(answers).length / Math.max(questions.length, 1)) * 100);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#D70040]" />
    </div>
  );

  if (result) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Personality Type</h2>
        <p className="text-3xl font-black text-[#D70040] mt-3 mb-6">{result.personalityType || result.scores?.personalityType}</p>

        <div className="space-y-3 text-left mb-6">
          {Object.entries(result.scores || {}).filter(([k]) => k !== 'personalityType').map(([trait, val]) => (
            <div key={trait}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 capitalize">{trait.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-semibold text-purple-600">{val as number}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/app/matches')}
            className="w-full bg-[#D70040] text-white py-3 rounded-xl font-semibold hover:bg-[#B00034] transition-colors flex items-center justify-center gap-2">
            View My Matches <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => { setResult(null); setCurrentQ(0); setAnswers({}); }}
            className="w-full bg-gray-50 text-gray-500 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Retake Test
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Personality Test</h1>
          <p className="text-gray-500 text-sm mt-1">Help us find your perfect match with AI-powered personality insights</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-5">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{Object.keys(answers).length}/{questions.length} answered</span>
            <span className="font-semibold text-purple-600">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" />
          </div>
        </div>

        {/* Question cards */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-2xl p-5 shadow-md transition-all ${i === currentQ ? 'ring-2 ring-purple-300' : ''}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 bg-purple-50 text-purple-600 text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.question}</p>
                {answers[q.id] && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {SCALE.map(({ val, label }) => (
                  <button key={val} onClick={() => handleAnswer(q.id, val)}
                    title={label}
                    className={`py-2 rounded-xl text-sm font-bold transition-all border-2 ${answers[q.id] === val ? 'border-purple-500 bg-purple-500 text-white scale-105' : 'border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-500'}`}>
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                <span>Strongly Disagree</span><span>Strongly Agree</span>
              </div>
            </motion.div>
          ))}
        </div>

        {Object.keys(answers).length === questions.length && questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pb-8">
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Brain className="w-5 h-5" /> Reveal My Personality</>}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
