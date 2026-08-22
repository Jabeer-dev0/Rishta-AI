const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  compatibilityScore: { type: Number, min: 0, max: 100 },

  aiInsights: {
    personalityMatch: { type: Number, min: 0, max: 100 },
    lifestyleCompatibility: { type: Number, min: 0, max: 100 },
    emotionalCompatibility: { type: Number, min: 0, max: 100 },
    longTermStability: { type: Number, min: 0, max: 100 },
    strengths: [{ type: String }],
    potentialHurdles: [{ type: String }],
    starInsight: { type: String },
  },

  matchReasons: [{ type: String }],
  report: { type: String },

  isActive: { type: Boolean, default: true },
  generatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
}, { timestamps: true });

// Ensure unique pair
matchSchema.index({ user: 1, matchedUser: 1 }, { unique: true });
matchSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Match', matchSchema);
