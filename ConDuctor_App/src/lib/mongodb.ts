
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

// Ticket Schema (Passengers_Ticket)
const TicketSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  routeNo: String,
  passengers: String,
  bookedBy: { type: mongoose.Schema.Types.Mixed }, // User Mobile
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
  return mongoose.models.FinalPassengerTicket || mongoose.model('FinalPassengerTicket', TicketSchema);
}

// User/Wallet Schema (Passengers_Wallet)
const UserSchema = new mongoose.Schema({
  phone: { type: mongoose.Schema.Types.Mixed, unique: true, required: true },
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
  return mongoose.models.FinalPassengerWallet || mongoose.model('FinalPassengerWallet', UserSchema);
}

// Production Conductors Schema (Conductors_Admin)
// This structure strictly handles the format provided including ID, Password, and Session tracking.
const ConductorSchema = new mongoose.Schema({
  conductorId: { type: mongoose.Schema.Types.Mixed, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: mongoose.Schema.Types.Mixed, required: true },
  sessionId: String,
  lastActive: { type: Date, default: Date.now }
}, { 
  timestamps: true, // Automatically handles createdAt and updatedAt
  collection: 'Conductors_Admin' 
});

export function getConductorModel() {
  return mongoose.models.FinalConductorAdmin || mongoose.model('FinalConductorAdmin', ConductorSchema);
}

// Conductor Log Schema
const ConductorLogSchema = new mongoose.Schema({
  conductorId: { type: String, required: true },
  type: { type: String, enum: ['ticket', 'pass'], required: true },
  data: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'conductor_logs' });

export function getConductorLogModel() {
  return mongoose.models.FinalConductorLog || mongoose.model('FinalConductorLog', ConductorLogSchema);
}

// Bus Pass Schema (Passengers_Bus_Pass_Data)
const BusPassSchema = new mongoose.Schema({
  passCode: { type: String, unique: true, required: true },
  name: String,
  validTill: Date,
  category: String,
  passType: String,
  status: { type: String, enum: ['valid', 'expired'], default: 'valid' },
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
  return mongoose.models.FinalPassengerBusPass || mongoose.model('FinalPassengerBusPass', BusPassSchema);
}

// Conductor Notifications Schema
const ConductorNotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconType: { type: String, default: 'info' },
  category: { type: String, default: 'blue' },
  isLatest: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'Conuctors_Notification' });

export function getConductorNotificationModel() {
  return mongoose.models.ConductorNotification || mongoose.model('ConductorNotification', ConductorNotificationSchema);
}
