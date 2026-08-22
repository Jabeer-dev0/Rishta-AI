import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, User, Calendar, MapPin, GraduationCap,
  Briefcase, Hash, Upload, Camera, CheckCircle,
  Shield, IdCard
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const TOTAL_STEPS = 4;

const stepTitles = [
  'Basic Information',
  'Professional Background',
  'Account Setup',
  'Identity Verification',
];

const stepIcons = [User, Briefcase, Shield, IdCard];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [cnicFront, setCnicFront] = useState<File | null>(null);
  const [cnicBack, setCnicBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    religion: '',
    city: '',
    education: '',
    profession: '',
    interests: '',
    familyBackground: '',
    email: '',
    password: '',
    cnic: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate age if DOB changes
      if (field === 'dateOfBirth' && value) {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        newData.age = age.toString();
      }
      
      return newData;
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fileToState = (
    file: File | null,
    setter: (f: File | null) => void,
    previewSetter: (s: string | null) => void
  ) => {
    setter(file);
    if (!file) { previewSetter(null); return; }
    const reader = new FileReader();
    reader.onloadend = () => previewSetter(reader.result as string);
    reader.readAsDataURL(file);
  };

  /** Per-step validation — account cannot proceed without required data. */
  const validateStep = (current: number): string | null => {
    if (current === 1) {
      if (!formData.name.trim()) return 'Full name is required';
      if (!formData.dateOfBirth) return 'Date of birth is required';
      if (!formData.gender) return 'Gender is required';
      if (!formData.religion.trim()) return 'Religion is required';
      if (!formData.city.trim()) return 'City is required';
      if (!profilePhoto) return 'Profile photo is required';
    }
    if (current === 2) {
      if (!formData.education.trim()) return 'Education is required';
      if (!formData.profession.trim()) return 'Profession is required';
      if (!formData.interests.trim()) return 'At least one interest is required';
      if (!formData.familyBackground.trim()) return 'Family background is required';
    }
    if (current === 3) {
      if (!formData.email.trim()) return 'Email is required';
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
    }
    if (current === 4) {
      const digits = formData.cnic.replace(/\D/g, '');
      if (digits.length !== 13) return 'CNIC must be exactly 13 digits (e.g. 35201-1234567-1)';
      if (!cnicFront) return 'CNIC front side photo is required';
      if (!cnicBack) return 'CNIC back side photo is required';
      if (!selfie) return 'A live selfie is required for face verification';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const [step, setStep] = useState(1);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('name', formData.name);
      data.append('dateOfBirth', formData.dateOfBirth);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      data.append('religion', formData.religion);
      data.append('city', formData.city);
      data.append('education', formData.education);
      data.append('profession', formData.profession);
      data.append('familyBackground', formData.familyBackground);
      data.append('bio', '');
      
      const interests = formData.interests.split(',').map(i => i.trim()).filter(Boolean);
      data.append('interests', JSON.stringify(interests));
      data.append('cnic', formData.cnic);

      if (profilePhoto) data.append('profilePhoto', profilePhoto);
      if (cnicFront) data.append('cnicFront', cnicFront);
      if (cnicBack) data.append('cnicBack', cnicBack);
      if (selfie) data.append('selfie', selfie);

      await signup(data as any);
      toast.success('Account created & identity verified! Welcome to Rishtaai 🎉');
      navigate('/app');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed — please check your documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE5EC] via-white to-pink-50 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[#D70040] rounded-2xl mb-4 shadow-lg shadow-[#D70040]/30"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900">Join Rishtaai</h1>
          <p className="text-gray-500 mt-1">Find your perfect match with AI</p>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {stepTitles.map((title, i) => {
              const num = i + 1;
              const Icon = stepIcons[i];
              const isActive = step === num;
              const isDone = step > num;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${
                    isDone
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-[#D70040] border-[#D70040] text-white scale-110 shadow-lg shadow-[#D70040]/30'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {i < stepTitles.length - 1 && (
                    <div className={`hidden sm:block absolute h-0.5 w-full -z-10 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D70040] to-pink-500"
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl shadow-xl p-7"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">{stepTitles[step - 1]}</h2>

            <form onSubmit={handleSubmit}>
              {/* ─── Step 1: Basic Info ─── */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Profile Photo Upload */}
                  <div className="flex flex-col items-center mb-6">
                    <div 
                      onClick={() => document.getElementById('profile-photo-input')?.click()}
                      className="relative w-28 h-28 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#D70040] hover:bg-pink-50 transition-all overflow-hidden group"
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400 group-hover:text-[#D70040]">
                          <Camera className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-medium">Add Photo</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input 
                      id="profile-photo-input" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange} 
                    />
                    <p className="text-xs text-gray-400 mt-2">Required for profile visibility</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Your full name" value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type="date" 
                        value={formData.dateOfBirth}
                        onChange={e => handleChange('dateOfBirth', e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Age</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input type="number" placeholder="25" value={formData.age}
                          readOnly
                          className="pl-9 bg-gray-100 border-gray-200 cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <Select value={formData.gender} onValueChange={v => handleChange('gender', v)} required>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Religion</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="e.g. Islam, Christianity" value={formData.religion}
                        onChange={e => handleChange('religion', e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="e.g. Karachi, Lahore" value={formData.city}
                        onChange={e => handleChange('city', e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200" required />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Step 2: Professional ─── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Education</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="e.g. Masters in Business" value={formData.education}
                        onChange={e => handleChange('education', e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Profession</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="e.g. Doctor, Engineer" value={formData.profession}
                        onChange={e => handleChange('profession', e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Interests <span className="text-gray-400 font-normal text-xs">(comma separated)</span></Label>
                    <Textarea placeholder="e.g. Reading, Travel, Cooking" value={formData.interests}
                      onChange={e => handleChange('interests', e.target.value)}
                      className="bg-gray-50 border-gray-200 min-h-[80px]" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Family Background</Label>
                    <Textarea placeholder="Tell us about your family values..." value={formData.familyBackground}
                      onChange={e => handleChange('familyBackground', e.target.value)}
                      className="bg-gray-50 border-gray-200 min-h-[80px]" required />
                  </div>
                </div>
              )}

              {/* ─── Step 3: Account Setup ─── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="your@email.com" value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      className="bg-gray-50 border-gray-200" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Create a strong password" value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      className="bg-gray-50 border-gray-200" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm Password</Label>
                    <Input type="password" placeholder="Repeat your password"
                      className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="bg-[#FFE5EC] rounded-xl p-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      By creating an account you agree to our <span className="text-[#D70040] font-semibold">Terms of Service</span> and <span className="text-[#D70040] font-semibold">Privacy Policy</span>. Your data is used only for matchmaking.
                    </p>
                  </div>
                </div>
              )}



              {/* ─── Step 4: Identity Verification ─── */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Aik CNIC = aik account. Aapka CNIC number, naam aur tareekh-e-paidaish card se AI ke zariye verify hongi,
                      aur selfie aapke CNIC photo se match ki jayegi. Documents sirf verification ke liye save hote hain.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>CNIC Number *</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="35201-1234567-1" value={formData.cnic}
                        onChange={e => handleChange('cnic', e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'front', label: 'CNIC Front *', file: cnicFront, preview: frontPreview, setFile: setCnicFront },
                      { key: 'back', label: 'CNIC Back *', file: cnicBack, preview: backPreview, setFile: setCnicBack },
                    ].map(({ key, label, file, preview, setFile }) => (
                      <div key={key} className="space-y-1.5">
                        <Label>{label}</Label>
                        <button type="button"
                          onClick={() => document.getElementById(`cnic-${key}-input`)?.click()}
                          className={`w-full aspect-[3/2] rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${preview ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-[#D70040] hover:bg-pink-50'}`}>
                          {preview ? (
                            <img src={preview} alt={`${key} preview`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <Upload className="w-6 h-6 mb-1" />
                              <span className="text-[10px]">Upload</span>
                            </div>
                          )}
                        </button>
                        <input id={`cnic-${key}-input`} type="file" accept="image/*" className="hidden"
                          onChange={(e) => fileToState(e.target.files?.[0] || null, setFile as any, key === 'front' ? setFrontPreview : setBackPreview)} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Live Selfie * <span className="text-gray-400 font-normal text-xs">(CNIC photo se match hogi)</span></Label>
                    <div className="flex items-center gap-4">
                      <button type="button"
                        onClick={() => document.getElementById('selfie-input')?.click()}
                        className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${selfiePreview ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-[#D70040] hover:bg-pink-50'}`}>
                        {selfiePreview ? (
                          <img src={selfiePreview} alt="selfie preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-7 h-7 text-gray-400" />
                        )}
                      </button>
                      <input id="selfie-input" type="file" accept="image/*" capture="user" className="hidden"
                        onChange={(e) => fileToState(e.target.files?.[0] || null, setSelfie, setSelfiePreview)} />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Achhi roshni mein saaf selfie lein — ye aapke CNIC ki photo se match ki jayegi.
                      </p>
                    </div>
                  </div>
                </div>
              )}



              {/* Nav Buttons */}
              <div className="flex gap-3 mt-7">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50">
                    ← Back
                  </Button>
                )}

                {step < TOTAL_STEPS ? (
                  <Button type="button" onClick={nextStep}
                    className="flex-1 bg-[#D70040] hover:bg-[#B00034] text-white">
                    Next →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-[#D70040] hover:bg-[#B00034] text-white gap-2"
                    disabled={loading}
                    onClick={handleSubmit as any}
                  >
                    {loading ? (
                      <>Verifying documents... (up to 1 min)</>
                    ) : (
                      <>🪪 Verify & Create Account</>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        </AnimatePresence>

        {/* Sign in link */}
        <div className="mt-5 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-[#D70040] font-semibold hover:underline">
              Log In
            </button>
          </p>
        </div>
        <div className="mt-3 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-gray-600">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
