import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getUserModel } from '@/lib/mongodb';
import { calculateFare } from '@/lib/fare-calculator';

export const dynamic = "force-dynamic";

/**
 * Reusable backend function to process fare refunds atomically.
 */
async function processFareRefund(ticketCode: string, originalFare: number, actualFare: number, phone: string) {
  try {
    const User = getUserModel();
    const refundAmount = originalFare - actualFare;

    if (refundAmount > 0 && phone) {
      // Atomically update walletBalance and push history
      const updatedUser = await User.findOneAndUpdate(
        { phone: phone },
        { 
          $inc: { walletBalance: refundAmount },
          $unset: { wallet: "" }, // Remove legacy field
          $push: { 
            transactions: {
              type: 'credit',
              description: `Category Downgrade Refund: ${ticketCode}`,
              amount: refundAmount,
              date: new Date()
            }
          }
        },
        { upsert: true, new: true }
      );
      
      console.log(`✅ Refund of Rs. ${refundAmount} credited to ${phone}. New Balance: ${updatedUser.walletBalance}`);
      return refundAmount;
    }
    return 0;
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
    const originalTotalFare = ticket.totalFare;
    let calculatedActualFare = originalTotalFare;

    if (actualBusType) {
        calculatedActualFare = calculateFare(ticket.from, ticket.to, ticket.quantities, actualBusType);
        
        // If boarding a lower category, issue refund
        if (calculatedActualFare < originalTotalFare) {
            refundIssued = await processFareRefund(ticketCode, originalTotalFare, calculatedActualFare, ticket.bookedBy);
            
            // Update ticket records with adjusted financial data
            ticket.refundAmount = refundIssued;
            ticket.refundProcessed = true;
            ticket.refundedAt = new Date();
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