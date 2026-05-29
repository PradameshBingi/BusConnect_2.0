import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://BusConnect:T15i8Mk8qFDyfVfl@cluster1.27qrhbu.mongodb.net/?appName=Cluster1";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4 
    };

    mongoose.set('strictQuery', true);

    console.log("⏳ Attempting to connect to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected Successfully to Cluster1");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

// Ticket Schema
const TicketSchema = new mongoose.Schema({
  ticketCode: { type: String, unique: true, required: true },
  status: { 
    type: String, 
    enum: ['valid', 'used', 'expired', 'cancelled'], 
    default: 'valid' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  from: { type: String, required: true },
  to: { type: String, required: true },
  routeNo: String,
  passengers: String,
  quantities: {
    Men: { type: Number, default: 0 },
    Child: { type: Number, default: 0 },
    Women: { type: Number, default: 0 }
  },
  totalFare: { type: Number, required: true },
  fare: { type: Number, required: true },
  busType: { type: String, required: true },
  securityCode: { type: String, required: true },
  bookedBy: { type: String, required: true },
  walletAmountUsed: { type: Number, default: 0 },
  validatedAt: Date
}, { 
  bufferCommands: true,
  timestamps: true,
  collection: 'tickets'
});

// Bus Pass Schema
const BusPassSchema = new mongoose.Schema({
  passCode: { type: String, unique: true, required: true },
  holderName: { type: String, required: true },
  passType: { type: String, enum: ['General', 'Route'], required: true },
  category: { type: String, enum: ['Student', 'Citizen'], required: true },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  validBusTypes: [{ type: String }],
  route: {
    from: String,
    to: String
  }
}, { 
  timestamps: true,
  collection: 'bus_passes'
});

// User Schema (For Wallet & Data Persistence)
const UserSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  walletBalance: { type: Number, default: 0 },
  sessionId: { type: String }, // For single-session tracking
  transactions: [{
    type: { type: String, enum: ['credit', 'debit'] },
    description: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  collection: 'users'
});

// Feedback Schema
const FeedbackSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  rating: { type: Number, required: true },
  category: { type: String, required: true },
  message: { type: String, required: true },
  suggestions: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { 
  collection: 'feedbacks'
});

export function getTicketModel() {
  return mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
}

export function getBusPassModel() {
  return mongoose.models.BusPass || mongoose.model('BusPass', BusPassSchema);
}

export function getUserModel() {
  return mongoose.models.User || mongoose.model('User', UserSchema);
}

export function getFeedbackModel() {
  return mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
}
