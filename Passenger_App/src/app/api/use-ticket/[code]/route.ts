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

    // 1. Terminology Stabilization
    const normalizeBusType = (type: string) => {
        if (!type) return "City Ordinary";
        const t = type.toLowerCase();
        if (t.includes('deluxe')) return 'Metro Deluxe';
        if (t.includes('express')) return 'Metro Express';
        return 'City Ordinary';
    };

    const originalBusType = normalizeBusType(ticket.busType);
    const newBusType = updateData.busType ? normalizeBusType(updateData.busType) : originalBusType;
    
    // 2. Determine Transition Type & Label
    let transitionMsg = "";
    const isValidation = updateData.status === 'used' || (Object.keys(updateData).length === 0 && ticket.status === 'valid');
    const isModification = (updateData.from || updateData.to || updateData.quantities) && !updateData.busType;
    const isUpgradation = updateData.busType && newBusType !== originalBusType;

    if (isValidation) {
        if (originalBusType !== newBusType) {
            transitionMsg = `Conductor Transition (${originalBusType} → ${newBusType})`;
        } else if (ticket.status !== 'used') {
            transitionMsg = "Conductor Validation";
        }
    } else if (isUpgradation) {
        transitionMsg = `Upgradation (${originalBusType} → ${newBusType})`;
    } else if (isModification) {
        transitionMsg = "Modification (Details Updated)";
    }

    // 3. Financial Processing Logic (Refunds for quantity decrease or category downgrade)
    const Wallet = getWalletModel();
    const phone = ticket.bookedBy;
    const oldFare = ticket.totalFare || 0;
    const newFare = updateData.totalFare !== undefined ? updateData.totalFare : oldFare;
    const diff = oldFare - newFare;
    
    if (phone && diff > 0) { // Refund detected
        const phoneNum = Number(phone);
        const query = {
            $or: [
              { phone: phone.toString() },
              { phone: isNaN(phoneNum) ? null : phoneNum }
            ].filter(c => c.phone !== null)
        };

        const refundWithFee = Math.round(diff * 0.90); // 10% fee
        await Wallet.findOneAndUpdate(query, {
            $inc: { walletBalance: refundWithFee },
            $push: {
                transactions: {
                    type: 'credit',
                    amount: refundWithFee,
                    description: `${transitionMsg || 'Adjustment'} Refund: ${ticketCode}`,
                    date: new Date()
                }
            }
        }, { upsert: true });
    }

    // 4. Update Ticket Document (Strict Array Safety)
    if (!Array.isArray(ticket.serviceTransition)) {
        ticket.serviceTransition = [];
    }
    
    if (transitionMsg) {
        ticket.serviceTransition.push(transitionMsg);
    }

    // Status logic: modifications/upgradations keep valid status, empty/explicit validation calls mark as used
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
    if (updateData.createdAt) ticket.createdAt = new Date(updateData.createdAt);

    await ticket.save();

    return NextResponse.json({ status: "updated", ticket: ticket.toObject() });

  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ error: err.message || "Internal Database Error" }, { status: 500 });
  }
}
