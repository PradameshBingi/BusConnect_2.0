import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getUserModel } from '@/lib/mongodb';
import { calculateFare } from '@/lib/fare-calculator';

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ 
        error: "Database Unreachable", 
        details: "Could not establish connection to MongoDB." 
      }, { status: 503 });
    }

    const { code } = await params;
    const ticketCode = code.toUpperCase();
    
    const body = await request.json().catch(() => ({}));
    const actualBusType = body.actualBusType;
    
    const Ticket = getTicketModel();
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) return NextResponse.json({ status: "invalid" }, { status: 404 });

    if (ticket.status === "used") {
      return NextResponse.json({ status: "already_used", message: "Ticket already validated" }, { status: 400 });
    }

    if (ticket.status === "cancelled") {
      return NextResponse.json({ status: "cancelled", message: "Ticket is cancelled" }, { status: 400 });
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

    // Handle Category Downgrade Refund with Transaction History
    let refundAmount = 0;
    if (actualBusType && actualBusType !== ticket.busType) {
        // Recalculate fare for the ACTUAL bus type boarded
        const newFare = calculateFare(ticket.from, ticket.to, ticket.quantities, actualBusType);
        const oldFare = ticket.totalFare;
        
        if (newFare < oldFare) {
            refundAmount = oldFare - newFare;
            
            // Credit refund back to passenger wallet Balance with history
            if (ticket.bookedBy) {
                const User = getUserModel();
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
                    { upsert: true, new: true }
                );
                console.log(`✅ Automated Wallet Refund Logged: Rs. ${refundAmount} for ${ticket.bookedBy}`);
            }
        }
        
        // UPDATE ticket with ACTUAL boarding details for the Pink Receipt
        ticket.busType = actualBusType;
        ticket.totalFare = newFare;
        ticket.fare = newFare; 
    }

    ticket.status = "used";
    ticket.validatedAt = new Date();
    await ticket.save();

    return NextResponse.json({ 
        status: "updated", 
        ticket: ticket.toObject(),
        refunded: refundAmount > 0 ? refundAmount : null
    });

  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ 
      error: "Database Unreachable", 
      details: err.message 
    }, { status: 500 });
  }
}
