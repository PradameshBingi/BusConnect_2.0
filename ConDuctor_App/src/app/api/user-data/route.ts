
import { NextResponse } from 'next/server';
import dbConnect, { getUserModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

  try {
    await dbConnect();
    const User = getUserModel();
    const phoneNum = Number(phone);
    
    // Search both string and number for robustness
    const user = await User.findOne({ 
      $or: [
        { phone: phone },
        { phone: isNaN(phoneNum) ? phone : phoneNum }
      ] 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: "DB Error", details: err.message }, { status: 500 });
  }
}
