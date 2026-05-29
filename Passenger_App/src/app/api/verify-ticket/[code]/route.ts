import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getUserModel } from '@/lib/mongodb';

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
    if (ticket.status === 'valid') {
        const now = new Date();
        const createdAt = new Date(ticket.createdAt);
        const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000);

        if (now > expiryTime) {
            ticket.status = 'expired';
            const totalPaid = ticket.totalFare || 0;
            refundAmount = Math.max(0, totalPaid - Math.round(totalPaid * 0.10));
            await ticket.save();

            // Credit cloud wallet for expired ticket
            const User = getUserModel();
            const user = await User.findOne({ phone: ticket.bookedBy });
            if (user) {
                user.walletBalance += refundAmount;
                user.transactions.push({
                    type: 'credit',
                    description: `Automatic Refund (Expired): ${ticketCode}`,
                    amount: refundAmount,
                    date: new Date()
                });
                await user.save();
            }
        }
    }

    return NextResponse.json({ 
        status: ticket.status, 
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
