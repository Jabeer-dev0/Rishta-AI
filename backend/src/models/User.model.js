const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ── Auth ──────────────────────────────────────────────
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },

  // ── Step 1: Basic Info ───────────────────────────────
  name: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true, min: 18, max: 80 },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  religion: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  country: { type: String, default: 'Pakistan', trim: true },

  // ── Step 2: Professional Info ────────────────────────
  education: { type: String, required: true, trim: true },
  profession: { type: String, required: true, trim: true },
  interests: [{ type: String, trim: true }],
  familyBackground: { type: String, trim: true },
  bio: { type: String, trim: true },

  // ── Photos ───────────────────────────────────────────
  photos: [{ type: String }],
  profilePhoto: { type: String },

  // ── CNIC Verification ─────────────────────────────────
  verified: { type: Boolean, default: false },
  cnicImageUrl: { type: String, select: false },   // Never expose to other users
  selfieImageUrl: { type: String, select: false },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified',
  },

  // ── Partner Preferences ──────────────────────────────
  partnerPreferences: {
    ageRange: {
      min: { type: Number, default: 20 },
      max: { type: Number, default: 40 },
    },
    cities: [{ type: String }],
    education: [{ type: String }],
    religions: [{ type: String }],
    professions: [{ type: String }],
  },

  // ── Personality Scores ───────────────────────────────
  personalityScores: {
    extraversion: { type: Number, min: 0, max: 100 },
    conscientiousness: { type: Number, min: 0, max: 100 },
    agreeableness: { type: Number, min: 0, max: 100 },
    openness: { type: Number, min: 0, max: 100 },
    emotionalStability: { type: Number, min: 0, max: 100 },
    personalityType: { type: String },
  },

  // ── Social Media ─────────────────────────────────────
  socialMediaConnected: {
    instagram: { type: Boolean, default: false },
    facebook: { type: Boolean, default: false },
    twitter: { type: Boolean, default: false },
  },
  socialTokens: {
    instagram: { type: String, select: false },
    facebook: { type: String, select: false },
    twitter: { type: String, select: false },
  },
  socialInsights: {
    detectedInterests: [{ type: String }],
    lifestyleScore: { type: Number },
    matchImprovement: { type: Number },
    dataPoints: { type: Number, default: 0 },
  },

  // ── Dashboard Stats ──────────────────────────────────
  profileViews: { type: Number, default: 0 },
  profileCompletion: { type: Number, default: 40 },
  aiScore: { type: Number, default: 0 },

  // ── Blocked Users ─────────────────────────────────────
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // ── Account Status ───────────────────────────────────
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // ── Password Reset ───────────────────────────────────
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },

  // ── Notification Preferences ─────────────────────────
  notificationPrefs: {
    matches: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    requests: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true });

// ── Virtual: zodiacSign ──────────────────────────────────
userSchema.virtual('zodiacSign').get(function() {
  if (!this.dateOfBirth) return null;
  const date = new Date(this.dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return null;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ───────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: calculate profile completion ────────
userSchema.methods.calculateProfileCompletion = function () {
  let score = 40; // base: basic info
  if (this.education && this.profession) score += 20;
  if (this.verified) score += 15;
  if (this.personalityScores?.personalityType) score += 15;
  if (Object.values(this.socialMediaConnected || {}).some(Boolean)) score += 10;
  return Math.min(score, 100);
};

// ── Hide sensitive fields from JSON output ───────────────
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.cnicImageUrl;
  delete obj.selfieImageUrl;
  delete obj.socialTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.blockedUsers;
  return obj;
};

// ── Indexes ───────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ city: 1 });
userSchema.index({ gender: 1 });
userSchema.index({ age: 1 });
userSchema.index({ verified: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
