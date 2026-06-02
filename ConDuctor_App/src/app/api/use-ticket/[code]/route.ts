import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getUserModel } from '@/lib/mongodb';
import { calculateFare } from '@/lib/fare-calculator';

export const dynamic = "force-dynamic";

/**
 * Reusable backend function to process fare refunds atomically.
 * This ensures the refund happens exactly once per ticket.
 */
async function processFareRefund(ticketCode: string, actualFare: number) {
  const Ticket = getTicketModel();
  const User = getUserModel();

  // 1. Atomically try to claim the refund for this ticket
  // The query includes refundProcessed: false to prevent duplicate executions
  const ticket = await Ticket.findOneAndUpdate(
    { 
      ticketCode: ticketCode, 
      status: 'valid', 
      refundProcessed: false 
    },
    { 
      $set: { 
        refundProcessed: true,
        actualFare: actualFare,
        refundedAt: new Date()
      } 
    },
    { new: true }
  );

  if (!ticket) {
    // If ticket not found or already processed, return null
    return null;
  }

  const refundAmount = ticket.totalFare - actualFare;

  if (refundAmount > 0 && ticket.bookedBy) {
    // 2. Atomically update the user wallet and push transaction history
    await User.findOneAndUpdate(
      { phone: ticket.bookedBy },
      { 
        $inc: { walletBalance: refundAmount },
        $push: { 
          transactions: {
            type: 'credit',
            description: `Category Downgrade Refund: ${ticketCode}`,
            amount: refundAmount,
            date: new Date()
          }
        }
      },
      { upsert: true } // Create user if doesn't exist (failsafe)
    );

    // Update ticket with the calculated refund amount
    ticket.refundAmount = refundAmount;
    await ticket.save();
    
    return refundAmount;
  }

  return 0;
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

    // Auto-expire check (10 min window)
    const now = new Date();
    const createdAt = new Date(ticket.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000);

    if (now > expiryTime && ticket.status === 'valid') {
        ticket.status = 'expired';
        await ticket.save();
        return NextResponse.json({ status: "expired", message: "Ticket has expired" }, { status: 400 });
    }

    // Process Refund if category is downgraded
    let refundIssued = 0;
    if (actualBusType && actualBusType !== ticket.busType) {
        const calculatedActualFare = calculateFare(ticket.from, ticket.to, ticket.quantities, actualBusType);
        
        if (calculatedActualFare < ticket.totalFare) {
            const refundResult = await processFareRefund(ticketCode, calculatedActualFare);
            refundIssued = refundResult || 0;
        }
        
        // Final updates to the ticket document for record keeping
        ticket.busType = actualBusType;
        ticket.actualFare = calculatedActualFare;
    }

    // Mark as used
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
