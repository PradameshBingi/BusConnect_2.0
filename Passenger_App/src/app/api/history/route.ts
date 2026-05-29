import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) return NextResponse.json({ error: "Phone missing" }, { status: 400 });

    const Ticket = getTicketModel();
    const tickets = await Ticket.find({ bookedBy: phone }).sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
