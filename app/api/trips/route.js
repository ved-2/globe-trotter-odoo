import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Trip from '@/models/Trip';
import User from '@/models/User';

export async function POST(request) {
  try {
    console.log('Starting POST request to /api/trips');
    
    const { userId: clerkUserId } = await auth();
    console.log('Auth result:', { userId: clerkUserId });
    
    if (!clerkUserId) {
      console.log('No userId found, returning 401');
      return NextResponse.json({ 
        error: 'Unauthorized - Please sign in to create trips' 
      }, { status: 401 });
    }

    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB();
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed. Please ensure MongoDB is running on localhost:27017',
        details: dbError.message,
        success: false 
      }, { status: 500 });
    }

    // Ensure a MongoDB User exists for this Clerk user; get its ObjectId
    let dbUser = await User.findOne({ clerkId: clerkUserId });
    if (!dbUser) {
      const cu = await currentUser();
      if (!cu) {
        return NextResponse.json({ error: 'Unable to load Clerk user' }, { status: 401 });
      }
      dbUser = await User.create({
        clerkId: cu.id,
        email: cu.emailAddresses?.[0]?.emailAddress || '',
        firstName: cu.firstName || 'User',
        lastName: cu.lastName || '',
        profileImage: cu.imageUrl || null,
      });
    }

    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    // Create new trip document with MongoDB User _id
    const trip = new Trip({
      ...body,
      userId: dbUser._id,
      aiGenerated: true,
      aiMetadata: {
        model: 'gemini-2.5-flash',
        prompt: body.aiPrompt || 'AI-generated trip plan',
        generatedAt: new Date(),
        version: '1.0'
      }
    });
    
    console.log('Trip object created:', JSON.stringify(trip, null, 2));
    console.log('Attempting to save trip...');
    
    try {
      await trip.save();
      console.log('Trip saved successfully:', trip._id);
    } catch (saveError) {
      console.error('Trip save failed:', saveError);
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.keys(saveError.errors).map(key => ({
          field: key,
          message: saveError.errors[key].message
        }));
        return NextResponse.json({ 
          error: 'Trip validation failed',
          details: saveError.message,
          validationErrors,
          success: false 
        }, { status: 400 });
      }
      throw saveError;
    }
    
    return NextResponse.json({ 
      success: true, 
      trip,
      message: 'Trip saved successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/trips:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoNetworkError' || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please ensure MongoDB is running.',
        details: error.message,
        success: false 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    console.log('Starting GET request to /api/trips');
    
    const { userId: clerkUserId } = await auth();
    console.log('Auth result:', { userId: clerkUserId });
    
    if (!clerkUserId) {
      console.log('No userId found, returning 401');
      return NextResponse.json({ 
        error: 'Unauthorized - Please sign in to view trips' 
      }, { status: 401 });
    }

    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB();
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed. Please ensure MongoDB is running on localhost:27017',
        details: dbError.message,
        success: false 
      }, { status: 500 });
    }
    
    const dbUser = await User.findOne({ clerkId: clerkUserId });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch trips for the MongoDB user
    const trips = await Trip.find({ userId: dbUser._id }).sort({ createdAt: -1 });
    console.log(`Found ${trips.length} trips for user ${dbUser._id}`);
    
    return NextResponse.json({ 
      success: true, 
      trips 
    });
    
  } catch (error) {
    console.error('Error in GET /api/trips:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoNetworkError' || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please ensure MongoDB is running.',
        details: error.message,
        success: false 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}
