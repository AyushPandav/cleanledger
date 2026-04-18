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
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

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

const PORT = 5000;
app.listen(PORT, () => console.log(`\n\n🟢 Express Server running on port ${PORT}`));
