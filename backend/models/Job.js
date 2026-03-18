const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: {
    type: String,
    enum: ['Applied', 'Interview Scheduled', 'Rejected', 'Offer Received'],
    default: 'Applied'
  },
  appliedDate: { type: Date, default: Date.now },
  interviewDate: { type: Date },
  notes: { type: String },
  geminiTips: { type: String }
});

module.exports = mongoose.model('Job', JobSchema);