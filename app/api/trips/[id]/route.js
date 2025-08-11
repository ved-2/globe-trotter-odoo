import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Trip from '@/models/Trip';

export async function GET(request, context) {
  try {
    await connectDB();
    const { id } = (await context).params;

    const trip = await Trip.findById(id);

    if (!trip) {
      return NextResponse.json({ 
        error: 'Trip not found',
        success: false 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      trip 
    });

  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    await connectDB();
    const { id } = (await context).params;

    const body = await request.json();
    const { itinerary } = body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (itinerary) {
      trip.itinerary = itinerary;
    }

    await trip.save();

    return NextResponse.json({ success: true, trip });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
