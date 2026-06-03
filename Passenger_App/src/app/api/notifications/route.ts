import { NextResponse } from 'next/server';
import dbConnect, { getNotificationModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const Notification = getNotificationModel();
    
    // Check if collection is empty to seed initial operational updates
    const count = await Notification.countDocuments();
    if (count === 0) {
      console.log("🚀 Seeding initial system notifications...");
      await Notification.insertMany([
        {
          title: "Maha Lakshmi Scheme Active",
          description: "Zero-fare travel is now active for all women and girls in TGSRTC City Ordinary and Metro Express services.",
          iconType: "zap",
          category: "emerald",
          isLatest: true,
          createdAt: new Date()
        },
        {
          title: "Ticket Modification Live",
          description: "Change your route or update passenger counts directly from the 'Modify Booking' portal for any valid ticket.",
          iconType: "ticket",
          category: "purple",
          isLatest: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        },
        {
          title: "Full Refund on Expiry",
          description: "Unused tickets that expire (10 mins after booking) are now automatically 100% refunded to your cloud wallet.",
          iconType: "wallet",
          category: "blue",
          isLatest: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        }
      ]);
    }

    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("❌ API /notifications Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
