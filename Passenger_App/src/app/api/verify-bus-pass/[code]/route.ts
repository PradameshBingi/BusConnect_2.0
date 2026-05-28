import { NextResponse } from 'next/server';
import dbConnect, { getBusPassModel } from '@/lib/mongodb';
import { busPasses } from '@/lib/bus-passes';

export const dynamic = "force-dynamic";

/**
 * GET /api/verify-bus-pass/[code]
 * Verifies a bus pass against both local sample data and MongoDB.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const passCode = code.toUpperCase();

    // 1. Try Local Mock Data first (from src/lib/bus-passes.ts)
    const mockPass = busPasses.find(p => p.passCode.toUpperCase() === passCode);
    if (mockPass) {
      console.log(`✅ Bus Pass verified from Sample Data: ${passCode}`);
      return NextResponse.json({ 
        status: "found", 
        pass: {
          ...mockPass,
          name: mockPass.holderName // Normalize field name for the UI
        } 
      });
    }

    // 2. Try MongoDB Database
    const conn = await dbConnect();
    if (!conn) {
      // If DB is down but local data wasn't found, we can't do much
      return NextResponse.json({ 
        status: "error", 
        message: "Database Unreachable" 
      }, { status: 503 });
    }

    const BusPass = getBusPassModel();
    const dbPass = await BusPass.findOne({ passCode });

    if (dbPass) {
      console.log(`✅ Bus Pass verified from MongoDB: ${passCode}`);
      const passObj = dbPass.toObject();
      return NextResponse.json({ 
        status: "found", 
        pass: {
          ...passObj,
          name: passObj.holderName || passObj.name // Normalization
        } 
      });
    }

    // 3. Not Found Anywhere
    console.warn(`⚠️ Bus Pass not found: ${passCode}`);
    return NextResponse.json({ 
      status: "not_found", 
      message: "Pass not found in system records." 
    }, { status: 404 });

  } catch (err: any) {
    console.error("❌ API /verify-bus-pass Error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: err.message 
    }, { status: 500 });
  }
}
