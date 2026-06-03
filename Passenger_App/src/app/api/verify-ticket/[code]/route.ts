import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getWalletModel } from '@/lib/mongodb';

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
            // Full Refund Policy for Expired Tickets
            refundAmount = ticket.totalFare || 0;
            await ticket.save();

            // Credit cloud wallet for expired ticket (Type-Robust)
            const Wallet = getWalletModel();
            const phone = ticket.bookedBy;
            if (phone) {
                const phoneNum = Number(phone);
                const query = {
                  $or: [
                    { phone: phone.toString() },
                    { phone: !isNaN(phoneNum) ? phoneNum : null }
                  ].filter(c => c.phone !== null)
                };

                await Wallet.findOneAndUpdate(query, {
                    $inc: { walletBalance: refundAmount },
                    $push: {
                        transactions: {
                            type: 'credit',
                            description: `Wallet: Full Refund (Expired) - ${ticketCode}`,
                            amount: refundAmount,
                            date: new Date()
                        }
                    }
                }, { upsert: true });
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
      error: "Internal Server Error", 
      details: err.message 
    }, { status: 500 });
  }
}
