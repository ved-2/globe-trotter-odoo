import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // This import is required
import connectToDatabase from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    // FIXED: Added back the auth() call to get the userId
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    // The { userId } in the find query now correctly refers to the authenticated user
    const bucketList = await db.collection('bucketList').find({ userId }).toArray();

    return NextResponse.json({ bucketList });
  } catch (error) {
    console.error('Error fetching bucket list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // FIXED: Added back the auth() call
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { destination, priority = 'medium', notes = '' } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const newItem = {
      userId, // This is now correctly defined
      destination,
      priority,
      notes,
      createdAt: new Date(),
    };

    const result = await db.collection('bucketList').insertOne(newItem);
    const createdItem = { ...newItem, _id: result.insertedId };

    return NextResponse.json({ bucketItem: createdItem }, { status: 201 });
  } catch (error) {
    console.error('Error adding to bucket list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // FIXED: Added back the auth() call
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    const objectId = new ObjectId(id);
    
    // This query now securely uses the authenticated userId
    const result = await db.collection('bucketList').deleteOne({ _id: objectId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found or you do not have permission to delete it.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item removed from bucket list' });
  } catch (error) {
    console.error('Error removing from bucket list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}