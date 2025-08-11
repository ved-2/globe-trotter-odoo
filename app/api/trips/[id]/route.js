import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Trip from '@/models/Trip';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
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
