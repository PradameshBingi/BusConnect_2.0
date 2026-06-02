import { NextResponse } from 'next/server';
import dbConnect, { getWalletModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

// GET wallet profile and balance
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) return NextResponse.json({ error: "Phone missing" }, { status: 400 });

    const Wallet = getWalletModel();
    let wallet = await Wallet.findOne({ phone });

    if (!wallet) {
      wallet = await Wallet.create({ 
        phone, 
        walletBalance: 0, 
        autoDeductEnabled: false,
        transactions: [] 
      });
    }

    // Sort transactions by date descending (newest first)
    const walletObj = wallet.toObject();
    if (walletObj.transactions) {
      walletObj.transactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return NextResponse.json(walletObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST update wallet (recharge, deduct, or session)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { phone, amount, type, description, sessionId } = data;

    const Wallet = getWalletModel();
    
    // Handle Session Update separately
    if (type === 'session_update') {
        const wallet = await Wallet.findOneAndUpdate(
            { phone },
            { $set: { sessionId } },
            { new: true, upsert: true }
        );
        return NextResponse.json({ status: "success", sessionId: wallet.sessionId });
    }

    const wallet = await Wallet.findOne({ phone });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    if (type === 'debit' && wallet.walletBalance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const adjustment = (type === 'credit' ? amount : -amount);
    
    // Atomic update
    const updatedWallet = await Wallet.findOneAndUpdate(
        { phone },
        { 
            $inc: { walletBalance: adjustment },
            $push: { 
                transactions: { 
                    type, 
                    amount, 
                    description, 
                    date: new Date() 
                } 
            }
        },
        { new: true }
    );

    return NextResponse.json({ 
        status: "success", 
        walletBalance: updatedWallet.walletBalance 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
