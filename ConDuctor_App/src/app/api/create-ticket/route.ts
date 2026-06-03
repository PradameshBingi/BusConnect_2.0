
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ 
        error: "Database Unreachable", 
        details: "Could not establish connection to MongoDB." 
      }, { status: 503 });
    }

    const data = await request.json();
    
    if (!data.from || !data.to || !data.securityCode) {
      return NextResponse.json({ error: "Missing required booking data" }, { status: 400 });
    }

    const routeNo = data.routeNo || "00";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `TKT-${routeNo}-${randomSuffix}`;

    const Ticket = getTicketModel();
    const ticketData = {
      ...data,
      ticketCode,
      status: "valid",
      createdAt: new Date()
    };

    const ticket = new Ticket(ticketData);
    const savedTicket = await ticket.save();
    
    return NextResponse.json({ 
      status: "created", 
      ticket: savedTicket.toObject() 
    }, { status: 201 });

  } catch (err: any) {
    console.error("❌ API /create-ticket Error:", err);
    if (err.code === 11000) {
      return NextResponse.json({ error: "Booking Collision" }, { status: 409 });
    }
    return NextResponse.json({ error: "Booking Failed", details: err.message }, { status: 500 });
  }
}
