import { NextRequest, NextResponse } from 'next/server';

// Webhook endpoint for Farcaster events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log webhook events (you can add custom logic here later)
    console.log('Webhook received:', body);

    // Respond with 200 to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
