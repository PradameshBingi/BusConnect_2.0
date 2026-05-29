import { NextResponse } from 'next/server';
import dbConnect, { getFeedbackModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.phone || !data.rating || !data.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const Feedback = getFeedbackModel();
    const feedback = await Feedback.create({
        phone: data.phone,
        rating: data.rating,
        category: data.category,
        message: data.message || "",
        suggestions: data.suggestions || "",
        createdAt: new Date()
    });

    return NextResponse.json({ status: "success", feedback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
