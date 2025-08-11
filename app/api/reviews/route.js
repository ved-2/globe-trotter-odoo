import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');
    const searchQuery = searchParams.get('search') || '';
    const tagFilter = searchParams.get('tag') || 'all';

    const query = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { destination: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    if (tagFilter && tagFilter !== 'all') {
      query.tags = { $regex: new RegExp(`^${tagFilter}$`, 'i') };
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Review.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const avatar = body.author.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    const reviewData = { ...body, avatar };
    const review = await Review.create(reviewData);
    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}