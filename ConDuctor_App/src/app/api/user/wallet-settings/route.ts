import { NextResponse } from 'next/server';
import dbConnect, { getUserModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone, autoDeductEnabled } = await request.json();

    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    const User = getUserModel();
    await User.findOneAndUpdate(
      { phone },
      { autoDeductEnabled },
      { upsert: true, new: true }
    );

    return NextResponse.json({ status: "success", autoDeductEnabled });
  } catch (err: any) {
    return NextResponse.json({ error: "DB Error", details: err.message }, { status: 500 });
  }
}
