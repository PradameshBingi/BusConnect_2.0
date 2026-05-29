import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(
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
    const updateData = await request.json().catch(() => ({}));
    
    const Ticket = getTicketModel();
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) return NextResponse.json({ status: "invalid" }, { status: 404 });

    if (ticket.status === "used" && !updateData.status && !updateData.totalFare) {
      return NextResponse.json({ status: "already_used", message: "Ticket already validated" }, { status: 400 });
    }

    if (ticket.status === "cancelled" && !updateData.status) {
      return NextResponse.json({ status: "cancelled", message: "Ticket is cancelled" }, { status: 400 });
    }

    // Standard expiry check (10 mins)
    const now = new Date();
    const createdAt = new Date(ticket.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000);
    
    if (now > expiryTime && ticket.status !== 'used' && !updateData.createdAt && !updateData.totalFare) {
        ticket.status = 'expired';
        await ticket.save();
        return NextResponse.json({ status: "expired", message: "Ticket has expired" }, { status: 400 });
    }

    // Apply updates
    if (updateData.status) {
      ticket.status = updateData.status;
    } else if (!updateData.from) { // Only mark as used if not a generic metadata update
      ticket.status = "used";
      ticket.validatedAt = new Date();
    }

    if (updateData.createdAt) {
      ticket.createdAt = new Date(updateData.createdAt);
    }

    // Generic Update Fields
    if (updateData.busType) ticket.busType = updateData.busType;
    if (updateData.totalFare !== undefined) ticket.totalFare = updateData.totalFare;
    if (updateData.fare !== undefined) ticket.fare = updateData.fare;
    if (updateData.from) ticket.from = updateData.from;
    if (updateData.to) ticket.to = updateData.to;
    if (updateData.passengers) ticket.passengers = updateData.passengers;
    if (updateData.quantities) ticket.quantities = updateData.quantities;

    await ticket.save();
    return NextResponse.json({ status: "updated", ticket: ticket.toObject() });

  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ 
      error: "Database Unreachable", 
      details: err.message 
    }, { status: 500 });
  }
}
