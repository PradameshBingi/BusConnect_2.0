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
    const updateData = await request.json().catch(() => ({}));
    
    const Ticket = getTicketModel();
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const normalizeBusType = (type: string) => {
        if (!type) return "City Ordinary";
        const t = type.toLowerCase();
        if (t.includes('deluxe')) return 'Metro Deluxe';
        if (t.includes('express')) return 'Metro Express';
        return 'City Ordinary';
    };

    const originalBusType = normalizeBusType(ticket.busType);
    const newBusType = updateData.busType ? normalizeBusType(updateData.busType) : originalBusType;
    
    let transitionMsg = "";
    const isValidation = updateData.status === 'used' || (Object.keys(updateData).length === 0 && ticket.status === 'valid');
    const isModification = (updateData.from || updateData.to || updateData.quantities) && !updateData.busType;
    const isUpgradation = updateData.busType && normalizeBusType(updateData.busType) !== originalBusType;

    if (isValidation) {
        if (originalBusType !== newBusType) {
            transitionMsg = `Conductor Transition (${originalBusType} → ${newBusType})`;
        } else if (ticket.status !== 'used') {
            transitionMsg = "Conductor Validation";
        }
    } else if (isUpgradation) {
        transitionMsg = `Upgradation (${originalBusType} → ${newBusType})`;
    } else if (isModification) {
        transitionMsg = "Passenger Modification";
    }

    const phone = ticket.bookedBy;
    if (phone) {
        const Wallet = getWalletModel();
        const oldFare = ticket.totalFare || 0;
        const newFare = updateData.totalFare !== undefined ? updateData.totalFare : oldFare;
        const diff = Math.round(oldFare - newFare);
        
        // If old > new, it's a refund (diff is positive)
        if (diff > 0) {
            const phoneNum = Number(phone);
            const walletQuery = {
                $or: [
                  { phone: phone.toString() },
                  { phone: !isNaN(phoneNum) ? phoneNum : null }
                ].filter(c => c.phone !== null)
            };

            const refundWithFee = Math.round(diff * 0.90); 
            await Wallet.findOneAndUpdate(walletQuery, {
                $inc: { walletBalance: refundWithFee },
                $push: {
                    transactions: {
                        type: 'credit',
                        amount: refundWithFee,
                        description: `Wallet: Conductor Adjustment Refund (${ticketCode})`,
                        date: new Date()
                    }
                }
            }, { upsert: true });
        }
    }

    if (!ticket.serviceTransition) ticket.serviceTransition = [];
    if (transitionMsg) ticket.serviceTransition.push(transitionMsg);

    if (isModification || isUpgradation) {
        ticket.createdAt = new Date();
    }

    if (updateData.status) {
        ticket.status = updateData.status;
    } else if (isValidation && ticket.status === 'valid') {
        ticket.status = 'used';
    }

    if (ticket.status === "used" && !ticket.validatedAt) {
        ticket.validatedAt = new Date();
    }
    
    ticket.updatedAt = new Date();
    if (updateData.from) ticket.from = updateData.from;
    if (updateData.to) ticket.to = updateData.to;
    if (updateData.quantities) ticket.quantities = updateData.quantities;
    if (updateData.passengers) ticket.passengers = updateData.passengers;
    if (updateData.totalFare !== undefined) ticket.totalFare = updateData.totalFare;
    if (updateData.fare !== undefined) ticket.fare = updateData.fare;
    if (updateData.busType) ticket.busType = newBusType;

    await ticket.save();

    return NextResponse.json({ status: "updated", ticket: ticket.toObject() });

  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ error: err.message || "Internal Database Error" }, { status: 500 });
  }
}
