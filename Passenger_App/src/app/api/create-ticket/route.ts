import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Ensure DB Connection is fully established
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ 
        error: "Database Unreachable", 
        details: "Could not establish connection to MongoDB." 
      }, { status: 503 });
    }

    // 2. Parse Request Data
    const data = await request.json();
    
    if (!data.from || !data.to || !data.securityCode) {
      return NextResponse.json({ error: "Missing required booking data (from, to, securityCode)" }, { status: 400 });
    }

    // 3. Generate Ticket Code
    const routeNo = data.routeNo || "00";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `TKT-${routeNo}-${randomSuffix}`;

    // 4. Create and Save Ticket
    const Ticket = getTicketModel();
    const ticketData = {
      ...data,
      ticketCode,
      status: "valid",
      createdAt: new Date()
    };

    const ticket = new Ticket(ticketData);
    
    // Explicitly await the save and ensure it's acknowledged
    const savedTicket = await ticket.save();
    
    console.log(`✅ Ticket successfully persisted in DB: ${ticketCode}`);

    return NextResponse.json({ 
      status: "created", 
      ticket: savedTicket.toObject() 
    }, { status: 201 });

  } catch (err: any) {
    console.error("❌ API /create-ticket Error:", err);
    
    // Handle duplicate key errors (e.g., ticketCode collision)
    if (err.code === 11000) {
      return NextResponse.json({ 
        error: "Booking Collision", 
        details: "A ticket with this code already exists. Please try again." 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: "Booking Failed", 
      details: err.message || "An unexpected error occurred during booking." 
    }, { status: 500 });
  }
}
