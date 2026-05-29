import { NextResponse } from 'next/server';
import dbConnect, { getFeedbackModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.phone || !data.rating || !data.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const Feedback = getFeedbackModel();
    const feedback = await Feedback.create(data);

    return NextResponse.json({ status: "success", feedback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
