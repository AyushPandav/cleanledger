import mongoose from 'mongoose';

const MONGODB_URI = process.env.EXPO_PUBLIC_MONGO_URI;

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectMongo() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  role: String,
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    
    // Create new user in Mongo
    const newUser = new User({
        firebaseUid: body.id,
        email: body.email,
        name: body.name,
        role: body.role
    });
    
    await newUser.save();
    return Response.json({ success: true, user: newUser });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
