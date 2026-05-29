import { NextResponse } from 'next/server';
import dbConnect, { getUserModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

// GET user profile and wallet
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) return NextResponse.json({ error: "Phone missing" }, { status: 400 });

    const User = getUserModel();
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({ phone, walletBalance: 0, transactions: [] });
    }

    // Sort transactions by date descending (newest first) before returning
    const userObj = user.toObject();
    if (userObj.transactions) {
      userObj.transactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return NextResponse.json(userObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST update wallet (recharge or deduct)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone, amount, type, description } = await request.json();

    const User = getUserModel();
    const user = await User.findOne({ phone });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (type === 'debit' && user.walletBalance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    user.walletBalance += (type === 'credit' ? amount : -amount);
    user.transactions.push({ type, amount, description, date: new Date() });

    await user.save();
    return NextResponse.json({ status: "success", walletBalance: user.walletBalance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
