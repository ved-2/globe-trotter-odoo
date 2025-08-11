import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    
    // Check if user already exists
    let user = await User.findOne({ clerkId: userId });
    
    if (user) {
      // Update existing user
      user = await User.findOneAndUpdate(
        { clerkId: userId },
        { 
          ...body,
          lastLoginAt: new Date()
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new user
      user = new User({
        clerkId: userId,
        ...body
      });
      await user.save();
    }
    
    return NextResponse.json({ 
      success: true, 
      user,
      message: user ? 'User updated successfully' : 'User created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error managing user:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        success: false 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user 
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}

