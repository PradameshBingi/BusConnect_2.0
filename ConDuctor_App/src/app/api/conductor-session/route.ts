
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
    
    // Robust search to find the conductor by ID (as string or number)
    const conductor = await Conductor.findOne({ 
      $or: [
        { conductorId: conductorId.toString().trim() },
        { conductorId: conductorId },
        { conductorId: isNaN(Number(conductorId)) ? conductorId : Number(conductorId) }
      ] 
    }).lean();

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
    const body = await request.json().catch(() => ({}));
    const { id, password, sessionId } = body;
    
    if (!id || !password) {
      return NextResponse.json({ status: "error", message: "ID and PIN are required" }, { status: 400 });
    }

    const Conductor = getConductorModel();
    const searchId = id.toString().trim();
    const searchPwd = password.toString().trim();

    // Use .lean() to ensure we get the raw document data without Mongoose casting interference
    const conductor = await Conductor.findOne({ 
      $or: [
        { conductorId: searchId },
        { conductorId: Number(searchId) },
        { conductorId: isNaN(Number(searchId)) ? searchId : Number(searchId) }
      ] 
    }).lean();

    if (!conductor) {
      return NextResponse.json({ status: "error", message: "Conductor ID Not Found" }, { status: 401 });
    }

    // Direct string comparison from the raw database object
    const dbPassword = String(conductor.password || "").trim();
    if (dbPassword !== searchPwd) {
      return NextResponse.json({ status: "error", message: "Invalid Security PIN" }, { status: 401 });
    }

    // Authorized - Update Session State using the raw ID
    const updated = await Conductor.findOneAndUpdate(
      { _id: conductor._id },
      { sessionId, lastActive: new Date() },
      { new: true }
    );

    return NextResponse.json({ 
      status: "success", 
      name: updated?.name || 'Staff Member' 
    });
  } catch (err: any) {
    console.error("Auth Error:", err.message);
    return NextResponse.json({ status: "error", message: "Authentication Service Unavailable" }, { status: 500 });
  }
}
