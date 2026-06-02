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

    const originalBusType = ticket.busType;
    const newBusType = updateData.busType || originalBusType;
    
    // 1. Determine Transition Type & Label
    let transitionMsg = "";
    const isValidation = updateData.status === 'used' || (Object.keys(updateData).length === 0 && ticket.status === 'valid');
    const isModification = (updateData.from || updateData.to || updateData.quantities) && !updateData.busType;
    const isUpgradation = updateData.busType && updateData.busType !== originalBusType;

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

    // 2. Financial Processing Logic
    const Wallet = getWalletModel();
    const phone = ticket.bookedBy;
    const diff = (ticket.totalFare || 0) - (updateData.totalFare || ticket.totalFare);
    
    if (phone && Math.abs(diff) > 0) {
        const phoneNum = Number(phone);
        const query = {
            $or: [
              { phone: phone.toString() },
              { phone: isNaN(phoneNum) ? null : phoneNum }
            ].filter(c => c.phone !== null)
        };

        if (diff > 0) { // Refund (Downgrade or Quantity Decrease)
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
        } else if (diff < 0) { // Deduction (Upgrade)
            const wallet = await Wallet.findOne(query);
            const amountToDeduct = Math.abs(diff);
            
            if (wallet && wallet.autoDeductEnabled) {
                await Wallet.findOneAndUpdate(query, {
                    $inc: { walletBalance: -amountToDeduct },
                    $push: {
                        transactions: {
                            type: 'debit',
                            amount: amountToDeduct,
                            description: `${transitionMsg || 'Adjustment'} Charge: ${ticketCode}`,
                            date: new Date()
                        }
                    }
                });
            }
        }
    }

    // 3. Update Ticket Document
    if (!ticket.serviceTransition) ticket.serviceTransition = [];
    if (transitionMsg) {
        ticket.serviceTransition.push(transitionMsg);
    }

    // Status logic: modifications keep current status, empty calls are validations
    if (updateData.status) {
        ticket.status = updateData.status;
    } else if (Object.keys(updateData).length === 0 && ticket.status === 'valid') {
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
    if (updateData.busType) ticket.busType = updateData.busType;
    if (updateData.createdAt) ticket.createdAt = new Date(updateData.createdAt);

    await ticket.save();

    return NextResponse.json({ status: "updated", ticket: ticket.toObject() });

  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ error: err.message || "Internal Database Error" }, { status: 500 });
  }
}
