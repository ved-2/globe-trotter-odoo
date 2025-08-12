import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Trip from '@/models/Trip';
import { auth } from '@clerk/nextjs/server';

export async function GET(request, { params }) {
  const { id } = await params;

  const { userId } = await auth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const trip = await Trip.findById(id);

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found', success: false }, { status: 404 });
    }

    if (trip.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } =  params;
  const { userId } = await auth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(id, { $set: body }, { new: true });

    return NextResponse.json({ success: true, trip: updatedTrip });
  } catch (error) {
    console.error('Error updating trip:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


