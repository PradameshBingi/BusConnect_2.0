import { NextResponse } from 'next/server';
import dbConnect, { getNotificationModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const Notification = getNotificationModel();
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("❌ API /notifications Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
