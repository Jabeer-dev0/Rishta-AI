const mongoose = require('mongoose');

const personalityResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  answers: [{ questionId: Number, score: Number }],
  scores: {
    extraversion: { type: Number, min: 0, max: 100 },
    conscientiousness: { type: Number, min: 0, max: 100 },
    agreeableness: { type: Number, min: 0, max: 100 },
    openness: { type: Number, min: 0, max: 100 },
    emotionalStability: { type: Number, min: 0, max: 100 },
  },
  personalityType: { type: String },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('PersonalityResult', personalityResultSchema);
