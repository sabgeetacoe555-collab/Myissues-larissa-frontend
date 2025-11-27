import { NextRequest, NextResponse } from 'next/server';
import { sendToGenComputer } from '@/lib/volcano-enhanced';

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

    const response = await sendToGenComputer(taskInput, context);

    return NextResponse.json({
      success: true,
      data: response,
      agent: 'gen-computer',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Gen Computer API Error:', error);

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
      message: 'Gen Computer Agent API is running',
      description: 'Specialized for computational tasks and code generation',
      endpoints: {
        POST: 'Send a computational task or code generation request',
      },
      requiredBody: {
        message: 'string (task description)',
        task: 'string (alternative to message)',
        context: 'object (optional additional context)',
      },
      capabilities: [
        'Code generation',
        'Algorithm implementation',
        'Data processing',
        'Computational analysis',
        'Script automation',
      ],
    },
    { status: 200 }
  );
}
