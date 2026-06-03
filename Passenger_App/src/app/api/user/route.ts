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

    /**
     * TRANSACTION TYPE LOGIC:
     * 'credit': +Balance, History: Credit (Green)
     * 'debit': -Balance, History: Debit (Red)
     * 'digital': 0 change, History: Debit (Red) - User wants external pay shown as debit from source
     * 'recharge': +Balance, History: Debit (Red) - User wants bank debit shown in red for recharge
     */
    let adjustment = 0;
    let historyType: 'credit' | 'debit' = 'debit';

    if (type === 'credit') {
        adjustment = amount;
        historyType = 'credit';
    } else if (type === 'debit') {
        if (wallet.walletBalance < amount) {
            return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }
        adjustment = -amount;
        historyType = 'debit';
    } else if (type === 'digital') {
        adjustment = 0;
        historyType = 'debit';
    } else if (type === 'recharge') {
        adjustment = amount;
        historyType = 'debit'; // Special requirement: Red color (debit from bank) for recharge
    }
    
    const updatedWallet = await Wallet.findOneAndUpdate(
        query,
        { 
            $inc: { walletBalance: adjustment },
            $push: { 
                transactions: { 
                    type: historyType, 
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
