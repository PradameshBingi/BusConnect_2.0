import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://BusConnect:T15i8Mk8qFDyfVfl@cluster1.27qrhbu.mongodb.net/test?appName=Cluster1";

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

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

// Ticket Schema
const TicketSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  routeNo: String,
  passengers: String,
  bookedBy: String, // Added to track passenger mobile for refunds
  quantities: {
    Men: { type: Number, default: 0 },
    Child: { type: Number, default: 0 },
    Women: { type: Number, default: 0 }
  },
  totalFare: { type: Number, required: true },
  fare: { type: Number, required: true },
  ticketCode: { type: String, unique: true, required: true },
  securityCode: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['valid', 'used', 'expired', 'cancelled'], 
    default: 'valid' 
  },
  createdAt: { type: Date, default: Date.now },
  busType: { type: String, required: true },
  validatedAt: Date,
  walletAmountUsed: { type: Number, default: 0 }
}, { 
  timestamps: true,
  collection: 'tickets'
});

export function getTicketModel() {
  return mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
}

// User Schema for Wallet Refunds
const UserSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  wallet: { type: Number, default: 0 },
  sessionId: String
}, { timestamps: true, collection: 'users' });

export function getUserModel() {
  return mongoose.models.User || mongoose.model('User', UserSchema);
}

// Bus Pass Schema
const BusPassSchema = new mongoose.Schema({
  passCode: { type: String, unique: true, required: true },
  name: String,
  validTill: Date,
  category: String,
  passType: String,
  busTypes: [String],
  route: {
    from: String,
    to: String
  }
}, { 
  timestamps: true,
  collection: 'bus_passes',
  strict: false
});

export function getBusPassModel() {
  return mongoose.models.BusPass || mongoose.model('BusPass', BusPassSchema);
}
