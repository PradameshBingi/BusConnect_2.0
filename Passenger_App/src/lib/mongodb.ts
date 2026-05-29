import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://BusConnect:T15i8Mk8qFDyfVfl@cluster1.27qrhbu.mongodb.net/?appName=Cluster1";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  // During build time, don't attempt to connect to DB
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4
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

// Ticket Schema Definition - Reordered as requested
const TicketSchema = new mongoose.Schema({
  ticketCode: { type: String, unique: true, required: true },
  status: { 
    type: String, 
    enum: ['valid', 'used', 'expired', 'cancelled'], 
    default: 'valid' 
  },
  createdAt: { type: Date, default: Date.now },
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
  timestamps: true, // This adds and manages updatedAt automatically
  collection: 'tickets'
});

// Bus Pass Schema Definition
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

export function getTicketModel() {
  return mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
}

export function getBusPassModel() {
  return mongoose.models.BusPass || mongoose.model('BusPass', BusPassSchema);
}
