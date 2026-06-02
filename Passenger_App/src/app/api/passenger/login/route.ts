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
    
    // Convert inputs to numbers for type-agnostic matching
    const phoneNum = Number(phone);
    const passNum = Number(password);

    // 1. Find the user by phone number (checking both string and numeric formats)
    // This is necessary because MongoDB stores Longs/Ints differently than Strings
    const user = await PassengerAdmin.findOne({
      $or: [
        { phone: phone.toString() },
        { phone: isNaN(phoneNum) ? null : phoneNum }
      ].filter(condition => condition.phone !== null)
    });

    if (!user) {
      console.log(`❌ Login Failed: User not found for phone ${phone}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Verify password (handling both string and numeric matches)
    const storedPassword = user.password;
    const isPasswordMatch = 
      (storedPassword.toString() === password.toString()) || 
      (!isNaN(passNum) && typeof storedPassword === 'number' && storedPassword === passNum);

    if (!isPasswordMatch) {
      console.log(`❌ Login Failed: Password mismatch for ${phone}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ Login Successful: ${phone}`);
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
