import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Settings, Bell, Shield, Trash2, Lock, User, Upload, Loader2, CheckCircle, XCircle, Camera } from 'lucide-react';
import { profileApi, verifyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

// ─── Face Capture Component ──────────────────────────────────────────────────
function FaceCapture({ onCapture, onCancel }: { onCapture: (blob: Blob) => void, onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) onCapture(blob);
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-inner">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-sm text-white">{error}</p>
            <button onClick={onCancel} className="mt-4 text-xs text-gray-400 underline">Go Back</button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
            <div className="absolute inset-0 border-2 border-[#D70040]/30 pointer-events-none">
              {/* Face Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-64 border-2 border-white/50 rounded-[100px] border-dashed"></div>
              </div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
          Cancel
        </button>
        <button onClick={capture} disabled={!!error}
          className="flex-[2] py-3 bg-[#D70040] text-white rounded-xl font-bold hover:bg-[#B00034] transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" /> Capture Photo
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profile' | 'notifications' | 'verify' | 'account'>('profile');
  const [saving, setSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    matches: true, messages: true, requests: true, marketing: false,
  });
  const [verifyStep, setVerifyStep] = useState<'idle' | 'camera' | 'verifying' | 'done'>('idle');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({ name: '', bio: '', profession: '', city: '', religion: '' });

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', bio: user.bio || '', profession: user.profession || '', city: user.city || '', religion: user.religion || '' });
      if (user.notificationPrefs) setNotifPrefs({ ...notifPrefs, ...user.notificationPrefs });
    }
    // Load verification status
    verifyApi.getStatus().then(res => {
      if (res.success && res.data?.verified) setVerifyStep('done');
    });
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await profileApi.update(profileData);
      if (res.success) { updateUser(res.data?.user); toast.success('Profile updated!'); }
      else toast.error(res.message);
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleSaveNotifs = async () => {
    setSaving(true);
    try {
      const res = await profileApi.updateNotifications(notifPrefs);
      if (res.success) toast.success('Notification preferences saved!');
      else toast.error(res.message);
    } catch { toast.error('Failed to save preferences'); }
    finally { setSaving(false); }
  };

  const handleVerifyFace = async (imageBlob: Blob) => {
    setVerifyStep('verifying');
    try {
      const file = new File([imageBlob], 'selfie.jpg', { type: 'image/jpeg' });
      const uploadRes = await verifyApi.uploadSelfie(file);
      
      if (uploadRes.success) {
        toast.info('Selfie uploaded! Running AI face match...');
        const res = await verifyApi.runVerification();
        if (res.success && res.data) {
          setVerifyResult(res.data);
          setVerifyStep('done');
          if (res.data.verified) {
            toast.success('Identity Verified! ✅');
            await refreshUser();
          } else {
            toast.error('Face match failed. Please ensure your profile photo is clear and try again.');
          }
        } else {
          toast.error(res.message);
          setVerifyStep('idle');
        }
      } else {
        toast.error(uploadRes.message);
        setVerifyStep('idle');
      }
    } catch (err) {
      toast.error('Verification failed');
      setVerifyStep('idle');
    }
  };



  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    try {
      const res = await profileApi.deleteAccount();
      if (res.success) { toast.success('Account deleted.'); await logout(); navigate('/'); }
      else toast.error(res.message);
    } catch { toast.error('Failed to delete account'); }
  };

  const TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'verify', label: 'Face Verify', icon: Shield },
    { key: 'account', label: 'Account', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === key ? 'bg-[#D70040] text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6">
          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-2">Edit Profile</h2>
              {[
                { key: 'name', label: 'Full Name' },
                { key: 'city', label: 'City' },
                { key: 'profession', label: 'Profession' },
                { key: 'religion', label: 'Religion' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                  <input value={(profileData as any)[key]}
                    onChange={e => setProfileData(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#D70040] focus:outline-none text-sm" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
                <textarea value={profileData.bio} onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))} rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#D70040] focus:outline-none text-sm resize-none" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving}
                className="w-full bg-[#D70040] text-white py-3 rounded-xl font-semibold hover:bg-[#B00034] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {tab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-2">Notification Preferences</h2>
              {[
                { key: 'matches', label: 'New AI Matches', desc: 'When a new compatible profile is found' },
                { key: 'messages', label: 'New Messages', desc: 'When someone sends you a message' },
                { key: 'requests', label: 'Connection Requests', desc: 'When someone wants to connect' },
                { key: 'marketing', label: 'Marketing Emails', desc: 'News, features and platform updates' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <button onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                    className={`w-11 h-6 rounded-full transition-all relative ${(notifPrefs as any)[key] ? 'bg-[#D70040]' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${(notifPrefs as any)[key] ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
              <button onClick={handleSaveNotifs} disabled={saving}
                className="w-full bg-[#D70040] text-white py-3 rounded-xl font-semibold hover:bg-[#B00034] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Face Verify Tab */}
          {tab === 'verify' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-1">Face Recognition Verification</h2>
              <p className="text-sm text-gray-500">Get a verified badge by matching your live face with your profile photo.</p>

              {user?.verified ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-800">Identity Verified ✅</p>
                    <p className="text-sm text-green-600">Your profile shows a Verified badge</p>
                  </div>
                </div>
              ) : !user?.profilePhoto ? (
                <div className="p-6 text-center bg-yellow-50 rounded-2xl border border-yellow-100">
                  <p className="text-sm text-yellow-700 mb-3">Please upload a profile photo first before verification.</p>
                  <button onClick={() => setTab('profile')} className="text-sm font-bold text-[#D70040] hover:underline">
                    Go to Profile →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifyStep === 'idle' && (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                      <Shield className="w-12 h-12 text-[#D70040] mx-auto mb-4 opacity-20" />
                      <h3 className="font-bold text-gray-900 mb-2">Ready to verify?</h3>
                      <p className="text-sm text-gray-500 mb-6">We will access your camera to take a quick selfie and compare it with your profile photo.</p>
                      <button onClick={() => setVerifyStep('camera')}
                        className="bg-[#D70040] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#B00034] transition-all shadow-lg shadow-red-100">
                        Start Verification
                      </button>
                    </div>
                  )}

                  {verifyStep === 'camera' && (
                    <FaceCapture 
                      onCapture={(blob) => handleVerifyFace(blob)} 
                      onCancel={() => setVerifyStep('idle')} 
                    />
                  )}

                  {verifyStep === 'verifying' && (
                    <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-pink-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#D70040] border-t-transparent rounded-full animate-spin"></div>
                        <Shield className="absolute inset-0 m-auto w-8 h-8 text-[#D70040]" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Verifying your identity</h3>
                      <p className="text-sm text-gray-500">Our AI is comparing your selfie with your profile photo...</p>
                    </div>
                  )}

                  {verifyStep === 'done' && verifyResult && (
                    <div className={`p-6 rounded-2xl border ${verifyResult.verified ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        {verifyResult.verified ? (
                          <CheckCircle className="w-12 h-12 text-green-500" />
                        ) : (
                          <XCircle className="w-12 h-12 text-red-500" />
                        )}
                        <div>
                          <h3 className={`font-bold ${verifyResult.verified ? 'text-green-900' : 'text-red-900'}`}>
                            {verifyResult.verified ? 'Verification Successful!' : 'Verification Failed'}
                          </h3>
                          <p className={`text-sm ${verifyResult.verified ? 'text-green-700' : 'text-red-700'}`}>
                            {verifyResult.message}
                          </p>
                        </div>
                      </div>
                      
                      {!verifyResult.verified && (
                        <button onClick={() => setVerifyStep('camera')}
                          className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors">
                          Try Again
                        </button>
                      )}
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-xl flex gap-3 items-start">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      <strong>Privacy Notice:</strong> Your verification selfie is used solely for identity matching and is never shown to other users. We use industry-standard face recognition AI to ensure a safe community.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Tab */}
          {tab === 'account' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-2">Account Settings</h2>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-500 mt-0.5">{user?.email ?? '—'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700">Member Since</p>
                <p className="text-sm text-gray-500 mt-0.5">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700">Account Status</p>
                <p className="text-sm mt-0.5 text-green-600 font-medium">Active</p>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                  <Lock className="w-4 h-4" /> Change Password
                </button>
                <button onClick={handleDeleteAccount}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-sm">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
