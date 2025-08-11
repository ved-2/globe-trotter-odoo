import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Trip from '@/models/Trip';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const trip = new Trip({
      ...body,
      aiGenerated: true,
      aiMetadata: {
        model: 'gemini-2.5-flash',
        prompt: body.aiPrompt || 'AI-generated trip plan',
        generatedAt: new Date(),
        version: '1.0'
      }
    });
    await trip.save();
    return NextResponse.json({ success: true, trip, message: 'Trip saved successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error', success: false }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const trips = await Trip.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, trips });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error', success: false }, { status: 500 });
  }
}
