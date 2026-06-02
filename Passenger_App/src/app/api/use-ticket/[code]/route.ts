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
    
    // Determine transition status
    const isValidation = updateData.status === 'used' || (!updateData.status && ticket.status === 'valid');
    const isPassengerChange = updateData.status === 'valid';

    // 1. Determine Transition Type & Label
    let transitionMsg = "";
    if (isValidation) {
        if (originalBusType !== newBusType) {
            transitionMsg = `Conductor Transition (${originalBusType} → ${newBusType})`;
        } else {
            transitionMsg = "Conductor Validation";
        }
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
        const phoneNum = Number(phone);
        const query = {
            $or: [
              { phone: phone.toString() },
              { phone: isNaN(phoneNum) ? null : phoneNum }
            ].filter(c => c.phone !== null)
        };

        if (diff > 0) { // Refund (Downgrade)
            const refundWithFee = Math.round(diff * 0.90); // 10% fee
            await Wallet.findOneAndUpdate(query, {
                $inc: { walletBalance: refundWithFee },
                $push: {
                    transactions: {
                        type: 'credit',
                        amount: refundWithFee,
                        description: `${transitionMsg} Refund: ${ticketCode}`,
                        date: new Date()
                    }
                }
            }, { upsert: true });
        } else if (diff < 0) { // Deduction (Upgrade)
            const wallet = await Wallet.findOne(query);
            const amountToDeduct = Math.abs(diff);
            
            // Only auto-deduct if enabled OR if initiated via digital payment (handled by client before API call)
            // But if this API is called from conductor side, it checks autoDeductEnabled
            if (wallet && wallet.autoDeductEnabled) {
                await Wallet.findOneAndUpdate(query, {
                    $inc: { walletBalance: -amountToDeduct },
                    $push: {
                        transactions: {
                            type: 'debit',
                            amount: amountToDeduct,
                            description: `${transitionMsg} Charge: ${ticketCode}`,
                            date: new Date()
                        }
                    }
                });
            }
        }
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
