import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Save, User, MapPin, Briefcase, GraduationCap, Heart, FileText, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    religion: user?.religion || '',
    city: user?.city || '',
    education: user?.education || '',
    profession: user?.profession || '',
    bio: user?.bio || '',
    interests: user?.interests?.join(', ') || '',
    familyBackground: user?.familyBackground || '',
    prefAgeMin: user?.partnerPreferences?.ageRange[0]?.toString() || '22',
    prefAgeMax: user?.partnerPreferences?.ageRange[1]?.toString() || '35',
    prefCities: user?.partnerPreferences?.cities?.join(', ') || '',
    prefEducation: user?.partnerPreferences?.education?.join(', ') || '',
    prefReligion: user?.partnerPreferences?.religions?.join(', ') || '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'dateOfBirth' && value) {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        next.age = age.toString();
      }
      return next;
    });
  };

  const handleSave = () => {
    updateUser({
      name: form.name,
      dateOfBirth: new Date(form.dateOfBirth),
      age: parseInt(form.age),
      gender: form.gender as any,
      religion: form.religion,
      city: form.city,
      education: form.education,
      profession: form.profession,
      bio: form.bio,
      interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
      familyBackground: form.familyBackground,
      partnerPreferences: {
        ageRange: [parseInt(form.prefAgeMin), parseInt(form.prefAgeMax)],
        cities: form.prefCities.split(',').map(s => s.trim()).filter(Boolean),
        education: form.prefEducation.split(',').map(s => s.trim()).filter(Boolean),
        religions: form.prefReligion.split(',').map(s => s.trim()).filter(Boolean),
        interests: [],
      },
      profileCompletion: Math.min(95, (user?.profileCompletion || 40) + 10),
    });
    toast.success('Profile updated successfully!');
    navigate('/app/profile');
  };

  const sections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        { label: 'Full Name', field: 'name', type: 'text', placeholder: 'Your full name' },
        { label: 'Date of Birth', field: 'dateOfBirth', type: 'date', placeholder: '' },
        { label: 'City', field: 'city', type: 'text', placeholder: 'e.g. Karachi, Lahore' },
        { label: 'Religion', field: 'religion', type: 'text', placeholder: 'e.g. Islam' },
      ]
    },
    {
      title: 'Professional Background',
      icon: Briefcase,
      fields: [
        { label: 'Profession', field: 'profession', type: 'text', placeholder: 'e.g. Software Engineer' },
        { label: 'Education', field: 'education', type: 'text', placeholder: 'e.g. Masters in Computer Science' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/app/profile')} className="p-2 rounded-xl hover:bg-white shadow-sm">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500">Keep your profile up to date</p>
          </div>
        </div>

        <div className="space-y-5">
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-5"
            >
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <section.icon className="w-4 h-4 text-[#D70040]" />
                {section.title}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {section.fields.map(f => (
                  <div key={f.field} className="space-y-1.5">
                    <Label className="text-sm text-gray-600">{f.label}</Label>
                    <Input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.field as keyof typeof form]}
                      onChange={e => handleChange(f.field, e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:border-[#D70040]"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Gender */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-5"
          >
            <h2 className="font-bold text-gray-800 mb-4">Gender</h2>
            <Select value={form.gender} onValueChange={v => handleChange('gender', v)}>
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* About & Bio */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
          >
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D70040]" /> About You
            </h2>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Bio</Label>
              <Textarea
                placeholder="Tell others about yourself, your values, and what you're looking for..."
                value={form.bio}
                onChange={e => handleChange('bio', e.target.value)}
                className="bg-gray-50 border-gray-200 min-h-[100px] focus:border-[#D70040]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Interests (comma separated)</Label>
              <Input
                placeholder="e.g. Reading, Travel, Cooking"
                value={form.interests}
                onChange={e => handleChange('interests', e.target.value)}
                className="bg-gray-50 border-gray-200 focus:border-[#D70040]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Family Background</Label>
              <Textarea
                placeholder="Describe your family background and values..."
                value={form.familyBackground}
                onChange={e => handleChange('familyBackground', e.target.value)}
                className="bg-gray-50 border-gray-200 min-h-[80px] focus:border-[#D70040]"
              />
            </div>
          </motion.div>

          {/* Partner Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
          >
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#D70040]" /> Partner Preferences
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-600">Min Age</Label>
                <Input type="number" value={form.prefAgeMin} onChange={e => handleChange('prefAgeMin', e.target.value)} className="bg-gray-50 border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-600">Max Age</Label>
                <Input type="number" value={form.prefAgeMax} onChange={e => handleChange('prefAgeMax', e.target.value)} className="bg-gray-50 border-gray-200" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Preferred Cities (comma separated)</Label>
              <Input placeholder="e.g. Karachi, Lahore, Islamabad" value={form.prefCities} onChange={e => handleChange('prefCities', e.target.value)} className="bg-gray-50 border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Education Preference</Label>
              <Input placeholder="e.g. Bachelors, Masters" value={form.prefEducation} onChange={e => handleChange('prefEducation', e.target.value)} className="bg-gray-50 border-gray-200" />
            </div>
          </motion.div>

          {/* Save */}
          <Button
            onClick={handleSave}
            className="w-full bg-[#D70040] hover:bg-[#B00034] text-white py-6 text-base font-semibold gap-2 rounded-2xl shadow-lg shadow-[#D70040]/20"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
