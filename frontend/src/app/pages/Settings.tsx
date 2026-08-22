import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Bell, Eye, Lock, Users, Sparkles, HelpCircle, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import Navigation from '../components/Navigation';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: {
      newMatches: true,
      messages: true,
      profileViews: false,
      aiSuggestions: true,
    },
    privacy: {
      profileVisibility: 'everyone',
      showOnlineStatus: true,
      readReceipts: true,
      showLastSeen: false,
    },
    aiFeatures: {
      socialMediaAnalysis: false,
      personalityInsights: true,
      relationshipForecast: true,
      autoSuggestions: true,
    },
  });

  const toggleSetting = (category: keyof typeof settings, key: string) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: !settings[category][key as keyof typeof settings[typeof category]],
      },
    });
  };

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to landing page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 pb-20 md:pb-0">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </motion.div>

          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <p className="text-sm text-gray-600">Control what notifications you receive</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">New Matches</h3>
                    <p className="text-sm text-gray-600">Get notified when you have a new match</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('notifications', 'newMatches')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.notifications.newMatches ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.notifications.newMatches ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Messages</h3>
                    <p className="text-sm text-gray-600">Get notified about new messages</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('notifications', 'messages')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.notifications.messages ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.notifications.messages ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Profile Views</h3>
                    <p className="text-sm text-gray-600">Get notified when someone views your profile</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('notifications', 'profileViews')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.notifications.profileViews ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.notifications.profileViews ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">AI Suggestions</h3>
                    <p className="text-sm text-gray-600">Get notified about AI match suggestions</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('notifications', 'aiSuggestions')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.notifications.aiSuggestions ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.notifications.aiSuggestions ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Privacy & Security</h2>
                  <p className="text-sm text-gray-600">Control your privacy settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold mb-2">Profile Visibility</h3>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 bg-white rounded-lg border border-gray-200 outline-none focus:border-primary"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="matches">Only Matches</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Show Online Status</h3>
                    <p className="text-sm text-gray-600">Let others see when you're online</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('privacy', 'showOnlineStatus')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.privacy.showOnlineStatus ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.privacy.showOnlineStatus ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Read Receipts</h3>
                    <p className="text-sm text-gray-600">Let others know when you've read their messages</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('privacy', 'readReceipts')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.privacy.readReceipts ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.privacy.readReceipts ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Show Last Seen</h3>
                    <p className="text-sm text-gray-600">Display when you were last active</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('privacy', 'showLastSeen')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.privacy.showLastSeen ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.privacy.showLastSeen ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Features</h2>
                  <p className="text-sm text-gray-600">Control AI-powered features</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Social Media Analysis</h3>
                    <p className="text-sm text-gray-600">Allow AI to analyze connected social profiles</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('aiFeatures', 'socialMediaAnalysis')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.aiFeatures.socialMediaAnalysis ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.aiFeatures.socialMediaAnalysis ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Personality Insights</h3>
                    <p className="text-sm text-gray-600">Get AI-powered personality analysis</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('aiFeatures', 'personalityInsights')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.aiFeatures.personalityInsights ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.aiFeatures.personalityInsights ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Relationship Forecast</h3>
                    <p className="text-sm text-gray-600">View AI compatibility predictions</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('aiFeatures', 'relationshipForecast')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.aiFeatures.relationshipForecast ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.aiFeatures.relationshipForecast ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold">Auto Suggestions</h3>
                    <p className="text-sm text-gray-600">Get AI conversation starters in chat</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('aiFeatures', 'autoSuggestions')}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.aiFeatures.autoSuggestions ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.aiFeatures.autoSuggestions ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Account</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <span>Change Password</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span>Blocked Users</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <span>Help & Support</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}