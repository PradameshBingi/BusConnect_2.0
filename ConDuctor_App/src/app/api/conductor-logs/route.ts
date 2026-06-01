import { NextResponse } from 'next/server';
import dbConnect, { getConductorLogModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conductorId = searchParams.get('conductorId');

  if (!conductorId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  try {
    await dbConnect();
    const ConductorLog = getConductorLogModel();
    const logs = await ConductorLog.find({ conductorId }).sort({ timestamp: -1 });

    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { conductorId, type, data } = await request.json();
    const ConductorLog = getConductorLogModel();

    const log = new ConductorLog({
      conductorId,
      type,
      data,
      timestamp: new Date()
    });

    await log.save();
    return NextResponse.json({ status: "logged" });
  } catch (err) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
