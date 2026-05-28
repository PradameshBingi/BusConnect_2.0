
import { NextResponse } from 'next/server';
import dbConnect, { getBusPassModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

/**
 * API route to verify a bus pass code against MongoDB 'test' database.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const { code } = await params;
    const passCode = code.toUpperCase();
    
    const BusPass = getBusPassModel();
    // Search by passCode (case-insensitive)
    const found = await BusPass.findOne({ 
      passCode: { $regex: new RegExp(`^${passCode}$`, 'i') } 
    });
    
    if (!found) {
      return NextResponse.json({ 
        status: "not_found", 
        message: "Pass not found in database" 
      }, { status: 404 });
    }

    const passData = found.toObject();

    // Aggressive mapping to handle all known field variations from manual MongoDB entries
    const normalizedPass = {
      ...passData,
      name: passData.name || passData.holderName || passData.Name || passData.HolderName || 'Unknown',
      validTill: passData.validTill || passData.validTo || passData.ValidTill || passData.ValidTo || passData.expiryDate || passData.ExpiryDate,
      // Ensure busTypes is captured even if key name differs
      busTypes: (passData.validBusTypes && passData.validBusTypes.length > 0) ? passData.validBusTypes : (passData.busTypes || passData.BusTypes || passData.validBusTypes || passData.ValidBusTypes || passData.busType || []),
      category: passData.category || passData.Category || 'General',
      passType: passData.passType || passData.PassType || 'Regular',
      // Ensure route object is mapped
      route: passData.route || passData.Route || { from: passData.from, to: passData.to }
    };

    return NextResponse.json({ 
      status: "success", 
      pass: normalizedPass
    });

  } catch (err: any) {
    console.error("❌ API /verify-bus-pass Error:", err);
    return NextResponse.json({ 
      error: "Search Failed", 
      details: err.message 
    }, { status: 500 });
  }
}
