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
  validatedAt: Date,
  boardingChanged: { type: Boolean, default: false },
  serviceTransition: { type: [String], default: [] },
  actualFare: { type: Number },
  refundAmount: { type: Number },
  refundProcessed: { type: Boolean, default: false },
  refundedAt: Date,
  deductionAmount: { type: Number },
  deductionProcessed: { type: Boolean, default: false },
  deductedAt: Date
}, { 
  bufferCommands: true,
  timestamps: true,
  collection: 'Passengers_Ticket'
});

// Wallet Schema
const WalletSchema = new mongoose.Schema({
  phone: { type: mongoose.Schema.Types.Mixed, unique: true, required: true },
  walletBalance: { type: Number, default: 0 },
  autoDeductEnabled: { type: Boolean, default: false },
  sessionId: { type: String },
  transactions: [{
    type: { type: String, enum: ['credit', 'debit'] },
    description: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  collection: 'Passengers_Wallet'
});

// Passenger Admin Schema
const PassengerAdminSchema = new mongoose.Schema({
  phone: { type: mongoose.Schema.Types.Mixed, unique: true, required: true },
  password: { type: mongoose.Schema.Types.Mixed, required: true },
  name: String,
  lastLogin: Date
}, { 
  timestamps: true,
  collection: 'Passenger_Admin'
});

// Conductor Admin Schema
const AdminSchema = new mongoose.Schema({
  adminId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  lastLogin: Date
}, { 
  timestamps: true,
  collection: 'Admin'
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
  collection: 'Passengers_Feedbacks'
});

export function getTicketModel() {
  return mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
}

export function getWalletModel() {
  return mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
}

export function getPassengerAdminModel() {
  return mongoose.models.PassengerAdmin || mongoose.model('PassengerAdmin', PassengerAdminSchema);
}

export function getAdminModel() {
  return mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
}

export function getFeedbackModel() {
  return mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
}
