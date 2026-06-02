import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getWalletModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

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
    
    const Ticket = getTicketModel();
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) {
      return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status !== "valid") {
      return NextResponse.json({ status: "error", message: `Ticket is already ${ticket.status}` }, { status: 400 });
    }

    // 1. Mark as cancelled
    ticket.status = "cancelled";
    ticket.updatedAt = new Date();
    await ticket.save();

    // 2. Credit Wallet (Standardizing on getWalletModel and phone matching)
    const Wallet = getWalletModel();
    const phone = ticket.bookedBy;
    
    const originalFare = ticket.totalFare || 0;
    const cancellationFee = Math.round(originalFare * 0.10);
    const refundAmount = Math.max(0, originalFare - cancellationFee);

    const query = {
      $or: [
        { phone: phone.toString() },
        { phone: !isNaN(Number(phone)) ? Number(phone) : null }
      ].filter(c => c.phone !== null)
    };

    const wallet = await Wallet.findOneAndUpdate(
        query,
        { 
            $inc: { walletBalance: refundAmount },
            $push: { 
                transactions: {
                    type: 'credit',
                    description: `Cancellation Refund: ${ticketCode}`,
                    amount: refundAmount,
                    date: new Date()
                }
            }
        },
        { new: true, upsert: true }
    );
    
    return NextResponse.json({ 
      status: "cancelled", 
      ticket: ticket.toObject(),
      refundAmount,
      newBalance: wallet.walletBalance
    });

  } catch (err: any) {
    console.error("❌ API /cancel-ticket Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
