import { NextResponse } from 'next/server';
import dbConnect, { getWalletModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone, autoDeductEnabled } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const Wallet = getWalletModel();
    const wallet = await Wallet.findOneAndUpdate(
      { phone },
      { $set: { autoDeductEnabled } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ 
      status: "success", 
      autoDeductEnabled: wallet.autoDeductEnabled 
    });

  } catch (error: any) {
    console.error("❌ API /wallet-settings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
