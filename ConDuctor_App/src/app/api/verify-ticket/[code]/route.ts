
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
    // Use Case-Insensitive search to ensure robust matching
    const ticket = await Ticket.findOne({ 
      ticketCode: { $regex: new RegExp(`^${ticketCode}$`, 'i') } 
    });
    
    if (!ticket) {
      console.log(`🔍 Ticket not found in Passengers_Ticket: ${ticketCode}`);
      return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
    }

    let refundAmount = 0;
    let currentStatus = ticket.status;

    // Auto-expiry logic (10-minute window)
    if (currentStatus === 'valid') {
        const now = new Date();
        const createdAt = new Date(ticket.createdAt);
        const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000);

        if (now > expiryTime) {
            ticket.status = 'expired';
            await ticket.save();
            currentStatus = 'expired';

            // Calculate potential refund (assuming 100% refund on expiry policy)
            const totalPaid = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0)) || 0;
            refundAmount = totalPaid;
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
