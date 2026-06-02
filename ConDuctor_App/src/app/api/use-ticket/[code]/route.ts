import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getUserModel } from '@/lib/mongodb';
import { calculateFare } from '@/lib/fare-calculator';

export const dynamic = "force-dynamic";

const getServiceLabel = (type: string) => {
  const map: Record<string, string> = { 
    ordinary: "City Ordinary", 
    express: "Metro Express", 
    deluxe: "Metro Deluxe" 
  };
  return map[type.toLowerCase()] || type;
};

/**
 * Reusable backend function to process fare refunds atomically.
 */
async function processFareRefund(
  ticketCode: string, 
  originalFare: number, 
  actualFare: number, 
  phone: string,
  originalService: string,
  actualService: string
) {
  try {
    const User = getUserModel();
    const refundAmount = originalFare - actualFare;

    if (refundAmount > 0 && phone) {
      const serviceTransition = `${getServiceLabel(originalService)} → ${getServiceLabel(actualService)}`;
      
      // Atomically update walletBalance and push history with requested history tag format
      const updatedUser = await User.findOneAndUpdate(
        { phone: phone },
        { 
          $inc: { walletBalance: refundAmount },
          $unset: { wallet: "" }, // Remove legacy field if it exists
          $push: { 
            transactions: {
              type: 'credit',
              description: `Fare Difference Refund (${serviceTransition}) ${ticketCode}`,
              amount: refundAmount,
              date: new Date()
            }
          }
        },
        { upsert: true, new: true }
      );
      
      console.log(`✅ Refund of Rs. ${refundAmount} credited to ${phone} for ${ticketCode}.`);
      return { refundAmount, serviceTransition };
    }
    return { refundAmount: 0, serviceTransition: null };
  } catch (error) {
    console.error("Refund processing error:", error);
    throw error;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ error: "Database Unreachable" }, { status: 503 });
    }

    const { code } = await params;
    const ticketCode = code.toUpperCase();
    
    const body = await request.json().catch(() => ({}));
    const actualBusType = body.actualBusType;
    
    const Ticket = getTicketModel();
    const ticket = await Ticket.findOne({ ticketCode });

    if (!ticket) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    if (ticket.status === "used") {
      return NextResponse.json({ message: "Ticket already validated" }, { status: 400 });
    }

    if (ticket.status === "cancelled") {
      return NextResponse.json({ message: "Ticket is cancelled" }, { status: 400 });
    }

    // Process Refund if category is changed
    let refundIssued = 0;
    let transitionString = null;
    const originalBusType = ticket.busType;
    const originalTotalFare = ticket.totalFare;
    let calculatedActualFare = originalTotalFare;

    if (actualBusType) {
        calculatedActualFare = calculateFare(ticket.from, ticket.to, ticket.quantities, actualBusType);
        
        // Handle logic for transitions and refunds
        if (calculatedActualFare < originalTotalFare) {
            const refundResult = await processFareRefund(
                ticketCode, 
                originalTotalFare, 
                calculatedActualFare, 
                ticket.bookedBy,
                originalBusType,
                actualBusType
            );
            refundIssued = refundResult.refundAmount;
            transitionString = refundResult.serviceTransition;
            
            // Update ticket records with adjusted financial and transition data
            ticket.refundAmount = refundIssued;
            ticket.refundProcessed = true;
            ticket.refundedAt = new Date();
            ticket.boardingChanged = true;
            ticket.serviceTransition = transitionString;
        } else {
            // No refund needed, but we still track transition if it's "Same to Same" or upgrade (unlikely scenario here)
            ticket.boardingChanged = originalBusType.toLowerCase() !== actualBusType.toLowerCase();
            ticket.serviceTransition = `${getServiceLabel(originalBusType)} → ${getServiceLabel(actualBusType)}`;
        }
        
        // Update ticket with the ACTUAL service and fare paid
        ticket.busType = actualBusType;
        ticket.totalFare = calculatedActualFare;
        ticket.actualFare = calculatedActualFare;
    }

    // Final Validation
    ticket.status = "used";
    ticket.validatedAt = new Date();
    await ticket.save();

    return NextResponse.json({ 
        status: "updated", 
        ticket: ticket.toObject(),
        refunded: refundIssued > 0 ? refundIssued : null,
        message: refundIssued > 0 ? `Refund of Rs. ${refundIssued} credited to wallet.` : "Validation successful."
    });

  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ 
      error: "Validation Failed", 
      details: err.message 
    }, { status: 500 });
  }
}