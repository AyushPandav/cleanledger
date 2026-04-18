require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.EXPO_PUBLIC_MONGO_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is undefined. Check your .env file.");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("\n🚀 Connected to MongoDB Atlas successfully!"))
    .catch(err => console.error("\n❌ MongoDB connection error:", err));
}

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  role: String,
  // ── Startup Profile Fields ──────────────────────────────
  description: String,
  industry: String,
  fundingGoal: Number,
  stage: String,
  profileComplete: { type: Boolean, default: false },
  profileCompletionScore: { type: Number, default: 0 },
  teamMembers: { type: Array, default: [] },
  milestones: { type: Array, default: [] },
  // ── AI Scorecard (written by Python backend result) ─────
  aiRiskLevel: String,
  aiTrustScore: Number,
  aiInsights: { type: Array, default: [] },
  aiWarnings: { type: Array, default: [] },
  aiSuggestions: { type: Array, default: [] },
  // ────────────────────────────────────────────────────────
  hasCommunity: { type: Boolean, default: false },
  // ── Verification & Legitimacy ──────────────────────────────────────────
  foundedYear: { type: String, default: "" },
  founderExperience: { type: String, default: "" },
  businessRegistered: { type: Boolean, default: false },
  kycCompleted: { type: Boolean, default: false },
  panId: { type: String, default: "" },
  gstRegistration: { type: String, default: "" },
  // ────────────────────────────────────────────────────────
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// ── Create user on signup ────────────────────────────────────────────────────
app.post('/api/user', async (req, res) => {
  try {
    const { id, email, name, role } = req.body;
    let user = await User.findOne({ id });
    if (!user) {
      user = new User({ id, email, name, role });
      await user.save();
    }
    console.log("✅ Saved user to MongoDB:", user.email);
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error saving user to MongoDB:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Get user profile data by ID ─────────────────────────────────────────────
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Save / update startup profile ───────────────────────────────────────────
app.put('/api/startup/profile', async (req, res) => {
  try {
    const {
      userId, name, description, industry, fundingGoal,
      stage, teamMembers, milestones,
      profileCompletionScore, profileComplete,
      aiRiskLevel, aiTrustScore, aiInsights, aiWarnings, aiSuggestions,
    } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const update = {
      updatedAt: new Date(),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(industry !== undefined && { industry }),
      ...(fundingGoal !== undefined && { fundingGoal }),
      ...(stage !== undefined && { stage }),
      ...(teamMembers !== undefined && { teamMembers }),
      ...(milestones !== undefined && { milestones }),
      ...(profileCompletionScore !== undefined && { profileCompletionScore }),
      ...(profileComplete !== undefined && { profileComplete }),
      // AI fields (optional — written after AI backend responds)
      ...(aiRiskLevel !== undefined && { aiRiskLevel }),
      ...(aiTrustScore !== undefined && { aiTrustScore }),
      ...(aiInsights !== undefined && { aiInsights }),
      ...(aiWarnings !== undefined && { aiWarnings }),
      ...(aiSuggestions !== undefined && { aiSuggestions }),
    };

    const user = await User.findOneAndUpdate(
      { id: userId },
      { $set: update },
      { new: true, upsert: false }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log("✅ Startup profile updated for:", user.email);
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error updating startup profile:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Get all startups (for Explore page ranking) ──────────────────────────────
app.get('/api/startups', async (req, res) => {
  try {
    const startups = await User.find(
      { role: 'startup', profileCompletionScore: { $gt: 0 } },
      { password: 0 } // never expose password
    ).sort({ aiTrustScore: -1, profileCompletionScore: -1 });

    res.json({ success: true, startups });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Toggle Community ─────────────────────────────────────────────────────────────
app.put('/api/user/:id/community', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { hasCommunity: req.body.hasCommunity, updatedAt: Date.now() },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`\n\n🟢 Express Server running on port ${PORT} (0.0.0.0)`));

