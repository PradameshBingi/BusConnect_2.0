
import { NextResponse } from 'next/server';
import dbConnect, { getBusPassModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const { code } = await params;
    const passCode = code.toUpperCase();
    
    const BusPass = getBusPassModel();
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
    const normalizedPass = {
      ...passData,
      name: passData.name || passData.holderName || passData.Name || 'Unknown',
      validTill: passData.validTill || passData.validTo || passData.expiryDate,
      busTypes: passData.validBusTypes || passData.busTypes || [],
      category: passData.category || passData.Category || 'General',
      passType: passData.passType || passData.PassType || 'Regular',
      route: passData.route || { from: passData.from, to: passData.to }
    };

    return NextResponse.json({ status: "success", pass: normalizedPass });

  } catch (err: any) {
    console.error("❌ API /verify-bus-pass Error:", err);
    return NextResponse.json({ error: "Search Failed", details: err.message }, { status: 500 });
  }
}
