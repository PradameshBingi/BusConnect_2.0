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
    
    // Robust query: handles strings and numbers (Int64/Int32) for phone and password
    const phoneNum = Number(phone);
    const passNum = Number(password);

    // Build an $or query to match against both String and Numeric formats
    const orConditions: any[] = [
      { phone: phone.toString(), password: password.toString() }
    ];
    
    if (!isNaN(phoneNum)) {
      // Case: phone is numeric, password is string
      orConditions.push({ phone: phoneNum, password: password.toString() });
      if (!isNaN(passNum)) {
        // Case: both are numeric
        orConditions.push({ phone: phoneNum, password: passNum });
      }
    }
    
    if (!isNaN(passNum)) {
      // Case: phone is string, password is numeric
      orConditions.push({ phone: phone.toString(), password: passNum });
    }

    const user = await PassengerAdmin.findOne({ $or: orConditions });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return NextResponse.json({ 
      status: "success", 
      user: {
        phone: phone.toString(),
        name: user.name || "Passenger"
      }
    });

  } catch (error: any) {
    console.error("❌ API /passenger/login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
