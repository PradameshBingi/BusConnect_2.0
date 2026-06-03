
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

// Ticket Schema - Primary source for verification
const TicketSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  routeNo: String,
  passengers: String,
  bookedBy: String, 
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
  walletAmountUsed: { type: Number, default: 0 },
  actualFare: { type: Number },
  refundAmount: { type: Number, default: 0 },
  refundProcessed: { type: Boolean, default: false },
  refundedAt: { type: Date },
  deductionAmount: { type: Number, default: 0 },
  deductionProcessed: { type: Boolean, default: false },
  boardingChanged: { type: Boolean, default: false },
  serviceTransition: { type: String }
}, { 
  timestamps: true,
  collection: 'Passengers_Ticket'
});

export function getTicketModel() {
  return mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
}

// User/Wallet Schema - Target for refunds and auto-deduct
const UserSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  walletBalance: { type: Number, default: 0 },
  autoDeductEnabled: { type: Boolean, default: false },
  transactions: [{
    type: { type: String, enum: ['credit', 'debit'] },
    description: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  sessionId: String
}, { timestamps: true, collection: 'Passengers_Wallet' });

export function getUserModel() {
  return mongoose.models.User || mongoose.model('User', UserSchema);
}

// Conductor Schema - Staff Admin management
const ConductorSchema = new mongoose.Schema({
  conductorId: { type: String, unique: true, required: true },
  sessionId: String,
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'Conductors_Admin' });

export function getConductorModel() {
  return mongoose.models.Conductor || mongoose.model('Conductor', ConductorSchema);
}

// Conductor Log Schema - Verification Insights
const ConductorLogSchema = new mongoose.Schema({
  conductorId: { type: String, required: true },
  type: { type: String, enum: ['ticket', 'pass'], required: true },
  data: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'conductor_logs' });

export function getConductorLogModel() {
  return mongoose.models.ConductorLog || mongoose.model('ConductorLog', ConductorLogSchema);
}

// Bus Pass Schema - Passenger Pass Data
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
  collection: 'Passengers_Bus_Pass_Data',
  strict: false
});

export function getBusPassModel() {
  return mongoose.models.BusPass || mongoose.model('BusPass', BusPassSchema);
}

// Notifications Collection
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconType: { type: String, default: 'info' },
  category: { type: String, default: 'blue' },
  isLatest: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'Notifications' });

export function getNotificationModel() {
  return mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
}
