/**
 * Volcano SDK Integration Layer
 * Provides wrapper functions for interacting with Volcano SDK endpoints
 */

export interface VolcanoMessage {
  message: string;
  context?: string;
}

export interface VolcanoResponse {
  response: string;
  model?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface VolcanoStreamChunk {
  content: string;
  done: boolean;
}

class VolcanoSDKError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'VolcanoSDKError';
  }
}

/**
 * Base configuration for Volcano SDK
 */
const getVolcanoConfig = () => {
  const baseUrl = process.env.VOLCANO_BASE_URL;
  const apiKey = process.env.VOLCANO_API_KEY;

  if (!baseUrl) {
    throw new VolcanoSDKError('VOLCANO_BASE_URL environment variable is not set');
  }

  if (!apiKey) {
    throw new VolcanoSDKError('VOLCANO_API_KEY environment variable is not set');
  }

  return { baseUrl, apiKey };
};

/**
 * Generic fetch wrapper with error handling
 */
async function volcanoFetch<T>(
  endpoint: string,
  data: VolcanoMessage,
  options: { stream?: boolean } = {}
): Promise<T | ReadableStream> {
  const { baseUrl, apiKey } = getVolcanoConfig();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': options.stream ? 'text/event-stream' : 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new VolcanoSDKError(
        `Volcano SDK request failed: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    if (options.stream && response.body) {
      return response.body as ReadableStream;
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof VolcanoSDKError) {
      throw error;
    }
    throw new VolcanoSDKError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}

/**
 * Send message to Larissa 70B Router
 * Routes the message to the appropriate specialized model
 */
export async function sendToRouter(message: string): Promise<VolcanoResponse> {
  return await volcanoFetch<VolcanoResponse>('/api/router', {
    message,
    context: 'larissa-router',
  });
}

/**
 * Send message to general LLM endpoint
 * Direct interaction with the language model
 */
export async function sendToLLM(message: string): Promise<VolcanoResponse> {
  return await volcanoFetch<VolcanoResponse>('/api/llm', {
    message,
  });
}

/**
 * Send query to Accountant GPT-OSS
 * Specialized for accounting, finance, and tax-related queries
 */
export async function sendToAccountant(message: string): Promise<VolcanoResponse> {
  return await volcanoFetch<VolcanoResponse>('/api/accountant', {
    message,
    context: 'accounting-finance',
  });
}

/**
 * Send query to Browser Tool
 * Enables web search and information retrieval
 */
export async function sendToBrowserTool(query: string): Promise<VolcanoResponse> {
  return await volcanoFetch<VolcanoResponse>('/api/browser', {
    message: query,
    context: 'web-search',
  });
}

/**
 * Stream response from any endpoint
 * Returns a ReadableStream for processing chunks
 */
export async function streamFromVolcano(
  endpoint: string,
  message: string
): Promise<ReadableStream> {
  const stream = await volcanoFetch<ReadableStream>(
    endpoint,
    { message },
    { stream: true }
  );

  if (!(stream instanceof ReadableStream)) {
    throw new VolcanoSDKError('Expected ReadableStream but got different type');
  }

  return stream;
}

/**
 * Parse Server-Sent Events (SSE) stream
 * Converts SSE format to structured chunks
 */
export async function* parseSSEStream(
  stream: ReadableStream
): AsyncGenerator<VolcanoStreamChunk> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            yield {
              content: parsed.content || parsed.response || '',
              done: false,
            };
          } catch {
            // Skip malformed JSON
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Health check for Volcano SDK connection
 */
export async function checkVolcanoHealth(): Promise<boolean> {
  try {
    const { baseUrl, apiKey } = getVolcanoConfig();
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export { VolcanoSDKError };
