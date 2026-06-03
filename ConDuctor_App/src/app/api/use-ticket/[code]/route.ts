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
 * Atomic Fare Adjustment Handler (Refined with specific transaction descriptions)
 */
async function processFareAdjustment(
  ticket: any, 
  actualFare: number, 
  conductorId: string
) {
  const User = getUserModel();
  const diff = ticket.totalFare - actualFare; // Positive = Refund, Negative = Deduction
  const phone = ticket.bookedBy;

  const bookedLabel = getServiceLabel(ticket.busType);
  const boardedLabel = getServiceLabel(ticket.actualBusType || ticket.busType);
  const transition = `${bookedLabel} -> ${boardedLabel}`;

  if (diff > 0) {
    // REFUND (Credit) - Conductor initiated refund for lower category boarding
    const amount = Math.abs(diff);
    await User.findOneAndUpdate(
      { phone: phone },
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
      { upsert: true }
    );
    ticket.refundAmount = amount;
    ticket.refundProcessed = true;
    ticket.refundedAt = new Date();
  } else if (diff < 0) {
    // DEDUCTION (Debit) - ONLY IF AUTHORIZED by passenger
    const amountToDeduct = Math.abs(diff);
    const user = await User.findOne({ phone });

    if (user?.autoDeductEnabled && user.walletBalance >= amountToDeduct) {
      await User.findOneAndUpdate(
        { phone: phone },
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
        }
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

    // Apply adjustments with precise logic
    ticket.actualBusType = actualBusType;
    await processFareAdjustment(ticket, calculatedFare, conductorId);
    
    // Update ticket state
    ticket.status = "used";
    ticket.validatedAt = new Date();
    ticket.busType = actualBusType;
    ticket.totalFare = calculatedFare;
    await ticket.save();

    // CLOUD SYNC: Log to Conductor Verification History
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
