import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';

export async function GET(request, { params }) {
  const { id } = params;
  await dbConnect();

  try {
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return NextResponse.json({ success: false, error: "Invalid ID format" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}