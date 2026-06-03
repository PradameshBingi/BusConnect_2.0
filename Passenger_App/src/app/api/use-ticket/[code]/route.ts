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

    // 1. Terminology Normalization Layer
    const normalizeBusType = (type: string) => {
        if (!type) return "City Ordinary";
        const t = type.toLowerCase();
        if (t.includes('deluxe')) return 'Metro Deluxe';
        if (t.includes('express')) return 'Metro Express';
        return 'City Ordinary';
    };

    const originalBusType = normalizeBusType(ticket.busType);
    const newBusType = updateData.busType ? normalizeBusType(updateData.busType) : originalBusType;
    
    // 2. Determine Transition Type & Granular Labeling
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
        const routePart = (updateData.from || updateData.to) 
          ? `Route Changed (${ticket.from} -> ${updateData.from || ticket.from} / ${ticket.to} -> ${updateData.to || ticket.to})` 
          : "";
        
        let passengerPart = "";
        if (updateData.quantities) {
            const pChanges = [];
            const types = ['Men', 'Child', 'Women'] as const;
            types.forEach(type => {
                const diff = (updateData.quantities[type] || 0) - (ticket.quantities[type] || 0);
                if (diff !== 0) {
                    pChanges.push(`${type}: ${diff > 0 ? '+' : ''}${diff}`);
                }
            });
            if (pChanges.length > 0) {
                passengerPart = `Passengers Added (${pChanges.join(', ')})`;
            }
        }
        
        const details = [routePart, passengerPart].filter(Boolean).join(" & ");
        transitionMsg = `Modification (${details})`;
    }

    // 3. Financial Processing Logic
    const phone = ticket.bookedBy;
    if (phone) {
        const Wallet = getWalletModel();
        const oldFare = ticket.totalFare || 0;
        const newFare = updateData.totalFare !== undefined ? updateData.totalFare : oldFare;
        const diff = oldFare - newFare;
        
        if (diff > 0) {
            const phoneNum = Number(phone);
            const walletQuery = {
                $or: [
                  { phone: phone.toString() },
                  { phone: !isNaN(phoneNum) ? phoneNum : null }
                ].filter(c => c.phone !== null)
            };

            const refundWithFee = Math.round(diff * 0.90); // 10% fee
            await Wallet.findOneAndUpdate(walletQuery, {
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
    }

    // 4. Update Ticket Document
    if (!ticket.serviceTransition || !Array.isArray(ticket.serviceTransition)) {
        ticket.serviceTransition = [];
    }
    
    if (transitionMsg) {
        ticket.serviceTransition.push(transitionMsg);
    }

    // Refresh timestamp for modifications or upgrades
    if (isModification || isUpgradation) {
        ticket.createdAt = new Date();
    }

    if (updateData.status) {
        ticket.status = updateData.status;
    } else if (isValidation && ticket.status === 'valid' && !updateData.from && !updateData.busType) {
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
