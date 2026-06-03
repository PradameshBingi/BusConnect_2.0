
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getUserModel, getConductorLogModel } from '@/lib/mongodb';
import { calculateFare } from '@/lib/fare-calculator';

export const dynamic = "force-dynamic";

const getServiceLabel = (type: string) => {
  const map: Record<string, string> = { 
    ordinary: "City Ordinary", 
    express: "Metro Express", 
    deluxe: "Metro Deluxe",
    "city ordinary": "City Ordinary",
    "metro express": "Metro Express",
    "metro deluxe": "Metro Deluxe"
  };
  return map[type.toLowerCase()] || type;
};

/**
 * Atomic Fare Adjustment Handler (Handles Type-Insensitive Wallet Search)
 */
async function processFareAdjustment(
  ticket: any, 
  actualFare: number, 
  conductorId: string
) {
  const User = getUserModel();
  const diff = ticket.totalFare - actualFare; 
  const phoneVal = (ticket.bookedBy || "").toString().trim();

  if (!phoneVal) return;

  const phoneNum = Number(phoneVal);
  // Search with $or to match either string ID or numeric ID in MongoDB
  const query = { 
    $or: [
      { phone: phoneVal },
      { phone: isNaN(phoneNum) ? phoneVal : phoneNum }
    ] 
  };

  const bookedLabel = getServiceLabel(ticket.busType);
  const boardedLabel = getServiceLabel(ticket.actualBusType || ticket.busType);
  const transition = `${bookedLabel} -> ${boardedLabel}`;

  if (diff > 0) {
    // REFUND (Credit)
    const amount = Math.abs(diff);
    const updatedUser = await User.findOneAndUpdate(
      query,
      { 
        $inc: { walletBalance: amount },
        $push: { 
          transactions: {
            type: 'credit',
            description: `Conductor: Ticket Upgradation (${transition}) ${ticket.ticketCode}`,
            amount: amount,
            date: new Date()
          }
        }
      },
      { new: true, upsert: false } 
    );
    
    if (updatedUser) {
      ticket.refundAmount = amount;
      ticket.refundProcessed = true;
      ticket.refundedAt = new Date();
    }
  } else if (diff < 0) {
    // DEDUCTION (Debit)
    const amountToDeduct = Math.abs(diff);
    const user = await User.findOne(query);

    if (user?.autoDeductEnabled && user.walletBalance >= amountToDeduct) {
      await User.findOneAndUpdate(
        query,
        { 
          $inc: { walletBalance: -amountToDeduct },
          $push: { 
            transactions: {
              type: 'debit',
              description: `Conductor: Ticket Upgradation (${transition}) ${ticket.ticketCode}`,
              amount: amountToDeduct,
              date: new Date()
            }
          }
        },
        { upsert: false }
      );
      ticket.deductionAmount = amountToDeduct;
      ticket.deductionProcessed = true;
    }
  }

  ticket.boardingChanged = diff !== 0;
  ticket.serviceTransition = `Modification (${transition})`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const { code } = await params;
    const body = await request.json().catch(() => ({}));
    const { actualBusType, conductorId } = body;

    const Ticket = getTicketModel();
    const ConductorLog = getConductorLogModel();
    
    const ticket = await Ticket.findOne({ ticketCode: code.toUpperCase() });
    if (!ticket) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    if (ticket.status !== "valid") return NextResponse.json({ message: `Ticket is ${ticket.status}` }, { status: 400 });

    const originalFare = ticket.totalFare;
    const calculatedFare = calculateFare(ticket.from, ticket.to, ticket.quantities, actualBusType);

    ticket.actualBusType = actualBusType;
    await processFareAdjustment(ticket, calculatedFare, conductorId);
    
    ticket.status = "used";
    ticket.validatedAt = new Date();
    ticket.busType = actualBusType;
    ticket.totalFare = calculatedFare;
    await ticket.save();

    if (conductorId) {
      await new ConductorLog({
        conductorId,
        type: 'ticket',
        data: {
          ticketCode: ticket.ticketCode,
          from: ticket.from,
          to: ticket.to,
          busType: actualBusType,
          totalFare: calculatedFare,
          originalFare,
          passengers: ticket.passengers,
          quantities: ticket.quantities,
          boardingChanged: ticket.boardingChanged,
          transition: ticket.serviceTransition
        }
      }).save();
    }

    return NextResponse.json({ 
      status: "success", 
      ticket: ticket.toObject(),
      refunded: ticket.refundAmount > 0 ? ticket.refundAmount : null,
      deducted: ticket.deductionAmount > 0 ? ticket.deductionAmount : null
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });
  }
}
