import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API server is working!',
    timestamp: new Date().toISOString(),
    success: true 
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST endpoint is working!',
    timestamp: new Date().toISOString(),
    success: true 
  });
}

