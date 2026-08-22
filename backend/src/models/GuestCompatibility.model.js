const mongoose = require('mongoose');

const GuestCompatibilitySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  personA: {
    name: String,
    age: Number,
    gender: String,
    religion: String,
    city: String,
    education: String,
    profession: String,
    interests: String,
    email: String
  },
  personB: {
    name: String,
    age: Number,
    gender: String,
    religion: String,
    city: String,
    education: String,
    profession: String,
    interests: String,
    email: String
  },
  result: {
    status: String,
    compatibilityScore: Number,
    report: String,
    strengths: [String],
    risks: [String],
    verdict: String,
    graphData: {
      personality: Number,
      lifestyle: Number,
      emotional: Number,
      values: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, { timestamps: true });

// Auto-delete expired sessions
GuestCompatibilitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('GuestCompatibility', GuestCompatibilitySchema);
