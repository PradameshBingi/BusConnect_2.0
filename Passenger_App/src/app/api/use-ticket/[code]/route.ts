import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel, getWalletModel, getConductorLogModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

/**
 * Service mapping for readable logs
 */
const serviceNames: Record<string, string> = {
  ordinary: 'City Ordinary',
  express: 'Metro Express',
  deluxe: 'Metro Deluxe'
};

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

    // Validation guard: Don't re-validate used tickets unless specifically updating metadata
    if (ticket.status === "used" && !updateData.force) {
      return NextResponse.json({ status: "already_used", message: "Ticket already validated" }, { status: 400 });
    }

    // 1. Calculate Fare Adjustment
    const bookedBus = ticket.busType;
    const boardedBus = updateData.busType || bookedBus;
    const actualFare = updateData.totalFare !== undefined ? updateData.totalFare : ticket.totalFare;
    const originalPaid = ticket.totalFare;
    
    const diff = originalPaid - actualFare; // Positive = Refund, Negative = Extra Charge
    const isRefund = diff > 0;
    const isCharge = diff < 0;
    const boardingChanged = bookedBus !== boardedBus;

    const transitionLabel = `${serviceNames[bookedBus] || bookedBus} → ${serviceNames[boardedBus] || boardedBus}`;

    // 2. Financial Processing
    const Wallet = getWalletModel();
    const phone = ticket.bookedBy;

    if (boardingChanged && !ticket.refundProcessed && !ticket.deductionProcessed) {
        if (isRefund) {
            // Automatic Refund
            await Wallet.findOneAndUpdate(
                { phone },
                { 
                    $inc: { walletBalance: Math.abs(diff) },
                    $push: { 
                        transactions: {
                            type: 'credit',
                            amount: Math.abs(diff),
                            description: `Fare Difference Refund (${transitionLabel}) ${ticketCode}`,
                            date: new Date()
                        }
                    }
                }
            );
            ticket.refundProcessed = true;
            ticket.refundAmount = Math.abs(diff);
            ticket.refundedAt = new Date();
        } else if (isCharge) {
            // Charge Logic (Requires Authorization)
            const userWallet = await Wallet.findOne({ phone });
            if (userWallet && userWallet.autoDeductEnabled && userWallet.walletBalance >= Math.abs(diff)) {
                await Wallet.findOneAndUpdate(
                    { phone },
                    { 
                        $inc: { walletBalance: -Math.abs(diff) },
                        $push: { 
                            transactions: {
                                type: 'debit',
                                amount: Math.abs(diff),
                                description: `Fare Difference Deducted (${transitionLabel}) ${ticketCode}`,
                                date: new Date()
                            }
                        }
                    }
                );
                ticket.deductionProcessed = true;
                ticket.deductionAmount = Math.abs(diff);
                ticket.deductedAt = new Date();
            }
        }
    }

    // 3. Update Ticket Document
    // If status is provided in payload (e.g. from modification form), use it.
    // Otherwise, default to "used" (for conductor validation)
    ticket.status = updateData.status || "used";
    
    if (ticket.status === "used") {
      ticket.validatedAt = new Date();
    }
    
    ticket.updatedAt = new Date();
    ticket.actualFare = actualFare;
    ticket.totalFare = actualFare;
    ticket.busType = boardedBus;
    ticket.boardingChanged = boardingChanged;
    ticket.serviceTransition = transitionLabel;

    if (updateData.from) ticket.from = updateData.from;
    if (updateData.to) ticket.to = updateData.to;
    if (updateData.quantities) ticket.quantities = updateData.quantities;
    if (updateData.passengers) ticket.passengers = updateData.passengers;
    if (updateData.fare !== undefined) ticket.fare = updateData.fare;
    if (updateData.createdAt) ticket.createdAt = new Date(updateData.createdAt);

    await ticket.save();

    // 4. Operational Log (Only if validated)
    if (ticket.status === "used") {
      const ConductorLog = getConductorLogModel();
      await ConductorLog.create({
          action: 'ticket_validation',
          ticketCode,
          amount: Math.abs(diff),
          type: isRefund ? 'refund' : isCharge ? 'deduction' : 'standard',
          timestamp: new Date()
      });
    }

    return NextResponse.json({ status: "updated", ticket: ticket.toObject() });

  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}
