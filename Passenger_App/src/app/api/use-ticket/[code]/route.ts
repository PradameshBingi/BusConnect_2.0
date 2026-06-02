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
    if (!ticket) return NextResponse.json({ status: "invalid" }, { status: 404 });

    const originalBusType = ticket.busType;
    const newBusType = updateData.busType || originalBusType;
    const isValidation = updateData.status === 'used' || (!updateData.status && ticket.status === 'valid');
    const isPassengerChange = updateData.status === 'valid';

    // 1. Determine Transition Type
    let transitionMsg = "";
    if (isValidation) {
        transitionMsg = `Conductor Transition (${originalBusType} → ${newBusType})`;
    } else if (isPassengerChange) {
        if (originalBusType !== newBusType) {
            transitionMsg = `Upgradation (${originalBusType} → ${newBusType})`;
        } else {
            transitionMsg = "Modification (Details Updated)";
        }
    }

    // 2. Financial Processing Logic
    const Wallet = getWalletModel();
    const phone = ticket.bookedBy;
    const diff = (ticket.totalFare || 0) - (updateData.totalFare || ticket.totalFare);
    
    if (Math.abs(diff) > 0) {
        const query = {
            $or: [
              { phone: phone.toString() },
              { phone: !isNaN(Number(phone)) ? Number(phone) : null }
            ].filter(c => c.phone !== null)
        };

        if (diff > 0) { // Refund
            const refundWithFee = Math.round(diff * 0.90); // 10% fee for downgrades/removals
            await Wallet.findOneAndUpdate(query, {
                $inc: { walletBalance: refundWithFee },
                $push: {
                    transactions: {
                        type: 'credit',
                        amount: refundWithFee,
                        description: `${transitionMsg} Refund for ${ticketCode}`,
                        date: new Date()
                    }
                }
            });
        }
        // Deductions (upgrades) are handled by the calling form (SimulatedPayment) 
        // or auto-deduct logic if conductor side.
    }

    // 3. Update Ticket Document
    if (transitionMsg) {
        ticket.serviceTransition.push(transitionMsg);
    }

    ticket.status = updateData.status || "used";
    if (ticket.status === "used") ticket.validatedAt = new Date();
    
    ticket.updatedAt = new Date();
    if (updateData.from) ticket.from = updateData.from;
    if (updateData.to) ticket.to = updateData.to;
    if (updateData.quantities) ticket.quantities = updateData.quantities;
    if (updateData.passengers) ticket.passengers = updateData.passengers;
    if (updateData.totalFare !== undefined) ticket.totalFare = updateData.totalFare;
    if (updateData.fare !== undefined) ticket.fare = updateData.fare;
    if (updateData.busType) ticket.busType = updateData.busType;
    if (updateData.createdAt) ticket.createdAt = new Date(updateData.createdAt);

    await ticket.save();

    return NextResponse.json({ status: "updated", ticket: ticket.toObject() });

  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
