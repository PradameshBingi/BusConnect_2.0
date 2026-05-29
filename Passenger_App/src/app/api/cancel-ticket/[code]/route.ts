import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getUserModel } from '@/lib/mongodb';

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
    
    const Ticket = getTicketModel();
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) {
      return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status === "used") {
      return NextResponse.json({ status: "already_used", message: "Cannot cancel a validated ticket" }, { status: 400 });
    }

    if (ticket.status === "cancelled") {
      return NextResponse.json({ status: "already_cancelled", message: "Ticket is already cancelled" }, { status: 400 });
    }

    // 1. Mark as cancelled
    ticket.status = "cancelled";
    await ticket.save();

    // 2. Credit Wallet
    const User = getUserModel();
    const user = await User.findOne({ phone: ticket.bookedBy });
    if (user) {
        const originalFare = ticket.totalFare || 0;
        const cancellationFee = Math.round(originalFare * 0.10);
        const refundAmount = Math.max(0, originalFare - cancellationFee);

        user.walletBalance += refundAmount;
        user.transactions.push({
            type: 'credit',
            description: `Cancellation Refund: ${ticketCode}`,
            amount: refundAmount,
            date: new Date()
        });
        await user.save();
    }
    
    return NextResponse.json({ status: "cancelled", ticket: ticket.toObject() });

  } catch (err: any) {
    console.error("❌ API /cancel-ticket Error:", err);
    return NextResponse.json({ 
      error: "Database Unreachable", 
      details: err.message 
    }, { status: 500 });
  }
}
