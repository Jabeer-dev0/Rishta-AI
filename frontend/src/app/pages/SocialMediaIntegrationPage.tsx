import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Instagram, Facebook, Twitter, Zap, TrendingUp, Target, Users, Unlink, ExternalLink, Loader2 } from 'lucide-react';
import { socialApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-pink-500 to-rose-500', desc: 'Analyze your lifestyle, interests and social patterns' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600', desc: 'Understand your values and relationship patterns' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'from-sky-400 to-sky-600', desc: 'Capture your thoughts and communication style' },
];

export default function SocialMediaIntegrationPage() {
  const { user, refreshUser } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await socialApi.getInsights();
        if (res.success) {
          setInsights(res.data?.insights);
          setConnected(res.data?.connected || {});
        }
      } catch { toast.error('Failed to load social insights'); }
      finally { setLoading(false); }
    };
    load();

    // Handle OAuth callback success param
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('connected');
    const error = params.get('error');
    if (platform) { toast.success(`${platform} connected successfully!`); load(); window.history.replaceState({}, '', window.location.pathname); }
    if (error) { toast.error('Failed to connect social media. Please check your OAuth credentials in the backend .env file'); window.history.replaceState({}, '', window.location.pathname); }
  }, []);

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      const res = await socialApi.getOAuthUrl(platform);
      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(`Could not get OAuth URL for ${platform}. Make sure ${platform.toUpperCase()}_CLIENT_ID is set in the backend .env file.`);
      }
    } catch {
      toast.error(`OAuth connection failed. Configure ${platform.toUpperCase()}_CLIENT_ID and ${platform.toUpperCase()}_REDIRECT_URI in your backend .env file.`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    setDisconnecting(platform);
    try {
      const res = await socialApi.disconnect(platform);
      if (res.success) {
        setConnected(prev => ({ ...prev, [platform]: false }));
        toast.success(`${platform} disconnected`);
        await refreshUser();
      } else toast.error(res.message);
    } catch { toast.error('Failed to disconnect'); }
    finally { setDisconnecting(null); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Social Media Integration</h1>
          <p className="text-gray-500 text-sm mt-1">Connect your social accounts to enhance AI matchmaking accuracy by up to 35%</p>
        </div>

        {/* AI Insights card */}
        {insights?.lifestyleScore && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#D70040] to-pink-500 rounded-2xl p-5 text-white mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              <h2 className="font-bold">Your AI Social Insights</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Lifestyle Score', value: `${insights.lifestyleScore}/10`, icon: TrendingUp },
                { label: 'Data Points', value: insights.dataPoints, icon: Target },
                { label: 'Match Boost', value: `+${insights.matchImprovement}%`, icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1 opacity-80" />
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-xs opacity-80">{label}</p>
                </div>
              ))}
            </div>
            {insights.detectedInterests?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {insights.detectedInterests.map((tag: string) => (
                  <span key={tag} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Platform cards */}
        <div className="space-y-4">
          {PLATFORMS.map(({ key, label, icon: Icon, color, desc }, i) => {
            const isConnected = connected[key];
            return (
              <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{label}</h3>
                        {isConnected && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">Connected ✓</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </div>

                  {isConnected ? (
                    <button onClick={() => handleDisconnect(key)} disabled={disconnecting === key}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-60">
                      {disconnecting === key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={() => handleConnect(key)} disabled={connecting === key}
                      className={`flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${color} text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60`}>
                      {connecting === key ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                      {connecting === key ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">⚙️ Developer Note:</span> OAuth connections require platform app credentials in the backend <code className="bg-yellow-100 px-1 rounded">.env</code> file (e.g., <code className="bg-yellow-100 px-1 rounded">INSTAGRAM_CLIENT_ID</code>). Without them, a helpful error will appear.
          </p>
        </div>
      </div>
    </div>
  );
}
