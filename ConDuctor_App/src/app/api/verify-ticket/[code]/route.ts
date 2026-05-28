import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET(
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

    let refundAmount = 0;
    let currentStatus = ticket.status;

    // Re-implemented Auto-expiry logic
    if (currentStatus === 'valid') {
        const now = new Date();
        const createdAt = new Date(ticket.createdAt);
        const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000);

        if (now > expiryTime) {
            // Automatically update database status to expired
            ticket.status = 'expired';
            await ticket.save();
            currentStatus = 'expired';

            // Calculate potential refund
            const totalPaid = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0)) || 0;
            refundAmount = Math.max(0, totalPaid - Math.round(totalPaid * 0.10));
        }
    }

    return NextResponse.json({ 
        status: currentStatus, 
        ticket: ticket.toObject(), 
        refundAmount 
    });

  } catch (err: any) {
    console.error("❌ API /verify-ticket Error:", err);
    return NextResponse.json({ 
      error: "Database Unreachable", 
      details: err.message 
    }, { status: 500 });
  }
}
