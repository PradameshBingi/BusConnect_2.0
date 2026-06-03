
import { NextResponse } from 'next/server';
import dbConnect, { getConductorModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

/**
 * Conductor Session API
 * Points to the Conductors_Admin collection for staff authentication.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conductorId = searchParams.get('id');

  if (!conductorId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  try {
    await dbConnect();
    const Conductor = getConductorModel();
    const conductor = await Conductor.findOne({ conductorId });

    return NextResponse.json({ 
      sessionId: conductor?.sessionId || null,
      lastActive: conductor?.lastActive
    });
  } catch (err) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { id, sessionId } = await request.json();
    const Conductor = getConductorModel();

    await Conductor.findOneAndUpdate(
      { conductorId: id },
      { sessionId, lastActive: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ status: "success" });
  } catch (err) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
