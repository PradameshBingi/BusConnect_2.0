import { NextResponse } from 'next/server';
import dbConnect, { getPassengerAdminModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 });
    }

    const PassengerAdmin = getPassengerAdminModel();
    const user = await PassengerAdmin.findOne({ phone, password });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return NextResponse.json({ 
      status: "success", 
      user: {
        phone: user.phone,
        name: user.name || "Passenger"
      }
    });

  } catch (error: any) {
    console.error("❌ API /passenger/login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
