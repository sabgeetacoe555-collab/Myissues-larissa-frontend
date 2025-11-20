import { NextRequest, NextResponse } from 'next/server';
import { sendToAccountant } from '@/lib/volcano';

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
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const response = await sendToAccountant(message);

    return NextResponse.json({
      success: true,
      data: response,
      model: 'accountant-gpt-oss',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Accountant API Error:', error);

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
      message: 'Accountant GPT-OSS API is running',
      description: 'Specialized for accounting, finance, and tax-related queries',
      endpoints: {
        POST: 'Send an accounting/finance query',
      },
      requiredBody: {
        message: 'string',
      },
      capabilities: [
        'Tax calculations and advice',
        'Financial analysis',
        'Accounting standards (GAAP, IFRS)',
        'Bookkeeping guidance',
        'Financial reporting',
      ],
    },
    { status: 200 }
  );
}
