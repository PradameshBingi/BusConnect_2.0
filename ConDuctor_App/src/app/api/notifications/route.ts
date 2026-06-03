
import { NextResponse } from 'next/server';
import dbConnect, { getConductorNotificationModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const Notification = getConductorNotificationModel();
    
    let notifications = await Notification.find({}).sort({ createdAt: -1 });

    // Self-Seeding Logic for Conductor Terminal
    if (notifications.length === 0) {
      const seedData = [
        {
          title: "Standard PIN Protocol",
          description: "Always verify the secondary 5-digit PIN to prevent fraudulent reuse of ticket screenshots.",
          iconType: "zap",
          category: "emerald",
          isLatest: true,
          createdAt: new Date()
        },
        {
          title: "Service Category Adjustment",
          description: "Use 'Category Adjustment' tool for passengers boarding higher services than booked.",
          iconType: "ticket",
          category: "purple",
          isLatest: true,
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          title: "Fraud Prevention Alert",
          description: "Only valid 10-digit IDs for bus passes must be accepted. Photo match is mandatory.",
          iconType: "wallet",
          category: "blue",
          isLatest: true,
          createdAt: new Date(Date.now() - 86400000)
        }
      ];
      try {
        await Notification.insertMany(seedData);
        notifications = await Notification.find({}).sort({ createdAt: -1 });
      } catch (seedErr) {
        console.warn("Seeding failed but continuing...");
      }
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (err: any) {
    return NextResponse.json({ notifications: [], error: "DB Error", details: err.message }, { status: 500 });
  }
}
