import { NextRequest, NextResponse } from 'next/server';
import { sendToChildAgent } from '@/lib/volcano-enhanced';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, task, agent, context } = body;

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

    // Validate agent type if specified
    if (agent && !['gen-computer', 'mathematician'].includes(agent)) {
      return NextResponse.json(
        { error: 'Invalid agent type. Must be "gen-computer" or "mathematician"' },
        { status: 400 }
      );
    }

    const response = await sendToChildAgent(taskInput, agent, context);

    return NextResponse.json({
      success: true,
      data: response,
      agent: response.agent || agent || 'auto-routed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Child Agent API Error:', error);

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
      message: 'Child Agent Router API is running',
      description: 'Intelligently routes tasks to Gen Computer or Mathematician agents',
      endpoints: {
        POST: 'Send a task to be automatically routed to the best agent',
      },
      requiredBody: {
        message: 'string (task description)',
        task: 'string (alternative to message)',
        agent: 'string (optional: "gen-computer" or "mathematician")',
        context: 'object (optional additional context)',
      },
      supportedAgents: {
        'gen-computer': 'Code generation and computational tasks',
        'mathematician': 'Mathematical computations and problem-solving',
        'auto': 'Automatic routing based on task analysis',
      },
    },
    { status: 200 }
  );
}
