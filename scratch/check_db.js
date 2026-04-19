require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.EXPO_PUBLIC_MONGO_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    const investments = await mongoose.connection.db.collection('investments').find({}).toArray();
    console.log("Total Investments:", investments.length);
    console.log("Investments:", JSON.stringify(investments, null, 2));
    
    const users = await mongoose.connection.db.collection('users').find({role: 'startup'}).toArray();
    console.log("Startups:", users.map(u => ({ id: u.id, name: u.name })));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
