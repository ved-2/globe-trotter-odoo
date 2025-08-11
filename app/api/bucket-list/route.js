import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

// Define schema and model (if not already defined elsewhere)
const bucketListSchema = new mongoose.Schema({
  destination: String,
  priority: { type: String, default: 'medium' },
  notes: String,
  addedDate: String,
  createdAt: Date,
});
const BucketList = mongoose.models.BucketList || mongoose.model('BucketList', bucketListSchema);

export async function GET() {
  await connectDB();
  const bucketList = await BucketList.find({});
  return NextResponse.json({ bucketList });
}

export async function POST(request) {
  await connectDB();
  const { destination, priority = 'medium', notes = '' } = await request.json();
  if (!destination) {
    return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
  }
  const newItem = await BucketList.create({
    destination,
    priority,
    notes,
    addedDate: new Date().toISOString(),
    createdAt: new Date(),
  });
  return NextResponse.json({ bucketItem: newItem }, { status: 201 });
}

export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }
  const result = await BucketList.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Item removed from bucket list' });
}