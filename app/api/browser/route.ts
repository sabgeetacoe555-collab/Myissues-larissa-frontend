import { NextRequest, NextResponse } from 'next/server';
import { sendToBrowserTool } from '@/lib/volcano';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    const response = await sendToBrowserTool(message);

    return NextResponse.json({
      success: true,
      data: response,
      query: message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Browser Tool API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = (error as any).statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: (error as any).details || null,
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Browser Tool API is running',
      description: 'Enables web search and information retrieval',
      endpoints: {
        POST: 'Send a search query to the browser tool',
      },
      requiredBody: {
        message: 'string (search query)',
      },
    },
    { status: 200 }
  );
}
