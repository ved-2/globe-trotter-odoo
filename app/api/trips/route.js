import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Trip from '@/models/Trip';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  // Authenticate the user properly
  const { userId } = await auth(request);  // <== await and pass request!
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    if (!body.destination || !body.startDate || !body.numberOfDays) {
      return NextResponse.json({ error: 'Missing required trip fields', success: false }, { status: 400 });
    }

    const trip = new Trip({
      ...body,
      userId,
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
    console.error("--- TRIP CREATION FAILED ---");
    console.error(error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return NextResponse.json({
        error: 'Validation failed. Please check your data.',
        details: validationErrors,
        success: false
      }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || 'Internal server error', success: false }, { status: 500 });
  }
}

export async function GET(request) {
  const { userId } = await auth(request);  // <== await and pass request!
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    await connectDB();
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, trips });
  } catch (error) {
    console.error("--- FAILED TO FETCH TRIPS ---");
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal server error', success: false }, { status: 500 });
  }
}
