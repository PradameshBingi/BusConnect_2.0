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
    
    // Type-robust lookup
    const phoneNum = Number(phone);
    const query = {
      $or: [
        { phone: phone.toString() },
        { phone: isNaN(phoneNum) ? null : phoneNum }
      ].filter(condition => condition.phone !== null)
    };

    let wallet = await Wallet.findOne(query);

    if (!wallet) {
      wallet = await Wallet.create({ 
        phone: isNaN(phoneNum) ? phone : phoneNum, 
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
    console.error("❌ API /user GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST update wallet (recharge, deduct, or session)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { phone, amount, type, description, sessionId } = data;

    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    const Wallet = getWalletModel();
    const phoneNum = Number(phone);
    const query = {
      $or: [
        { phone: phone.toString() },
        { phone: isNaN(phoneNum) ? null : phoneNum }
      ].filter(condition => condition.phone !== null)
    };
    
    // Handle Session Update separately
    if (type === 'session_update') {
        const wallet = await Wallet.findOneAndUpdate(
            query,
            { $set: { sessionId } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return NextResponse.json({ status: "success", sessionId: wallet.sessionId });
    }

    const wallet = await Wallet.findOne(query);
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    // Digital payments record history but DON'T adjust balance
    const isExternalDigital = type === 'digital';
    
    if (type === 'debit' && !isExternalDigital && wallet.walletBalance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Adjustment logic: Credits add, Debits subtract, Digital/Other is 0
    const adjustment = type === 'credit' ? amount : (isExternalDigital ? 0 : -amount);
    
    // Atomic update
    const updatedWallet = await Wallet.findOneAndUpdate(
        query,
        { 
            $inc: { walletBalance: adjustment },
            $push: { 
                transactions: { 
                    type: (isExternalDigital || type === 'debit') ? 'debit' : 'credit', 
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
    console.error("❌ API /user POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
