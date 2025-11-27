import { NextRequest, NextResponse } from 'next/server';
import { sendToMathematician } from '@/lib/volcano-enhanced';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, task, context } = body;

    const taskInput = task || message;

    if (!taskInput || typeof taskInput !== 'string') {
      return NextResponse.json(
        { error: 'Task or message is required and must be a string' },
        { status: 400 }
      );
    }

    if (taskInput.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task cannot be empty' },
        { status: 400 }
      );
    }

    const response = await sendToMathematician(taskInput, context);

    return NextResponse.json({
      success: true,
      data: response,
      agent: 'mathematician',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Mathematician API Error:', error);

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
      message: 'Mathematician Agent API is running',
      description: 'Specialized for mathematical computations and problem-solving',
      endpoints: {
        POST: 'Send a mathematical problem or computation request',
      },
      requiredBody: {
        message: 'string (problem description)',
        task: 'string (alternative to message)',
        context: 'object (optional additional context)',
      },
      capabilities: [
        'Mathematical problem solving',
        'Complex calculations',
        'Statistical analysis',
        'Equation solving',
        'Mathematical proofs',
        'Optimization problems',
      ],
    },
    { status: 200 }
  );
}
