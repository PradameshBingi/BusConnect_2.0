
import { NextResponse } from 'next/server';
import dbConnect, { getConductorModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

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
      lastActive: conductor?.lastActive,
      name: conductor?.name || 'Staff Member'
    });
  } catch (err) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, password, sessionId } = body;
    const Conductor = getConductorModel();

    // Verify Conductor Credentials against Conductors_Admin collection
    const conductor = await Conductor.findOne({ conductorId: id });

    if (!conductor) {
      return NextResponse.json({ status: "error", message: "Conductor ID Not Found" }, { status: 401 });
    }

    if (conductor.password !== password) {
      return NextResponse.json({ status: "error", message: "Invalid Security PIN" }, { status: 401 });
    }

    // Success - Update Session
    const updated = await Conductor.findOneAndUpdate(
      { conductorId: id },
      { sessionId, lastActive: new Date() },
      { new: true }
    );

    return NextResponse.json({ 
      status: "success", 
      name: updated?.name || 'Staff Member' 
    });
  } catch (err: any) {
    return NextResponse.json({ status: "error", error: "DB Error", details: err.message }, { status: 500 });
  }
}
