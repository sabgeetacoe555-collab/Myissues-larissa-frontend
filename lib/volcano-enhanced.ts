/**
 * Enhanced Volcano SDK Integration Layer with Child Agent Support
 * Supports: LLM Wrapper, Gen Computer, Mathematician, Child Agent
 */

export interface VolcanoMessage {
  message: string;
  context?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface VolcanoResponse {
  response: string;
  model?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
  agentType?: 'router' | 'llm' | 'accountant' | 'browser' | 'gen-computer' | 'mathematician' | 'child-agent';
}

export interface VolcanoStreamChunk {
  content: string;
  done: boolean;
}

export interface ChildAgentRequest {
  task: string;
  agent: 'gen-computer' | 'mathematician';
  context?: Record<string, unknown>;
}

export interface ChildAgentResponse {
  result: string;
  agent: string;
  computationTime?: number;
  metadata?: Record<string, unknown>;
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
  const baseUrl = process.env.VOLCANO_BASE_URL || process.env.NEXT_PUBLIC_VOLCANO_BASE_URL;
  const apiKey = process.env.VOLCANO_API_KEY || process.env.NEXT_PUBLIC_VOLCANO_API_KEY;

  if (!baseUrl) {
    throw new VolcanoSDKError('VOLCANO_BASE_URL environment variable is not set');
  }

  if (!apiKey) {
    throw new VolcanoSDKError('VOLCANO_API_KEY environment variable is not set');
  }

  return { baseUrl, apiKey };
};

/**
 * Get Child Agent configuration
 */
const getChildAgentConfig = () => {
  return {
    genComputerUrl: process.env.GEN_COMPUTER_API_URL || `${process.env.VOLCANO_BASE_URL}/gen-computer`,
    mathematicianUrl: process.env.MATHEMATICIAN_API_URL || `${process.env.VOLCANO_BASE_URL}/mathematician`,
    childAgentUrl: process.env.CHILD_AGENT_API_URL || `${process.env.VOLCANO_BASE_URL}/child-agent`,
    llmWrapperUrl: process.env.LLM_WRAPPER_URL || `${process.env.VOLCANO_BASE_URL}/llm-wrapper`,
  };
};

/**
 * Generic fetch wrapper with error handling and retry logic
 */
async function volcanoFetch<T>(
  endpoint: string,
  data: VolcanoMessage | ChildAgentRequest,
  options: { stream?: boolean; timeout?: number; retries?: number } = {}
): Promise<T | ReadableStream> {
  const { baseUrl, apiKey } = getVolcanoConfig();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const timeout = options.timeout || parseInt(process.env.API_TIMEOUT || '30000');
  const maxRetries = options.retries || parseInt(process.env.API_RETRY_ATTEMPTS || '3');

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': options.stream ? 'text/event-stream' : 'application/json',
          'X-Request-ID': `larissa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      lastError = error as Error;
      
      if (error instanceof VolcanoSDKError) {
        throw error;
      }

      // Retry on network errors or timeouts
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }

  throw new VolcanoSDKError(
    `Network error after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    undefined,
    lastError
  );
}

/**
 * Send message to Larissa 70B Router
 * Routes the message to the appropriate specialized model
 */
export async function sendToRouter(message: string, options?: Partial<VolcanoMessage>): Promise<VolcanoResponse> {
  const response = await volcanoFetch<VolcanoResponse>('/api/router', {
    message,
    context: 'larissa-router',
    ...options,
  });
  return { ...response as VolcanoResponse, agentType: 'router' };
}

/**
 * Send message to general LLM endpoint via wrapper
 * Direct interaction with the language model
 */
export async function sendToLLM(message: string, options?: Partial<VolcanoMessage>): Promise<VolcanoResponse> {
  const config = getChildAgentConfig();
  const response = await volcanoFetch<VolcanoResponse>(config.llmWrapperUrl, {
    message,
    ...options,
  });
  return { ...response as VolcanoResponse, agentType: 'llm' };
}

/**
 * Send query to Accountant GPT-OSS
 * Specialized for accounting, finance, and tax-related queries
 */
export async function sendToAccountant(message: string, options?: Partial<VolcanoMessage>): Promise<VolcanoResponse> {
  const response = await volcanoFetch<VolcanoResponse>('/api/accountant', {
    message,
    context: 'accounting-finance',
    ...options,
  });
  return { ...response as VolcanoResponse, agentType: 'accountant' };
}

/**
 * Send query to Browser Tool
 * Enables web search and information retrieval
 */
export async function sendToBrowserTool(query: string, options?: Partial<VolcanoMessage>): Promise<VolcanoResponse> {
  const response = await volcanoFetch<VolcanoResponse>('/api/browser', {
    message: query,
    context: 'web-search',
    ...options,
  });
  return { ...response as VolcanoResponse, agentType: 'browser' };
}

/**
 * Send task to Gen Computer Agent
 * Specialized for computational tasks and code generation
 */
export async function sendToGenComputer(task: string, context?: Record<string, unknown>): Promise<ChildAgentResponse> {
  const config = getChildAgentConfig();
  const response = await volcanoFetch<ChildAgentResponse>(config.genComputerUrl, {
    task,
    agent: 'gen-computer',
    context,
  });
  return response as ChildAgentResponse;
}

/**
 * Send task to Mathematician Agent
 * Specialized for mathematical computations and problem-solving
 */
export async function sendToMathematician(task: string, context?: Record<string, unknown>): Promise<ChildAgentResponse> {
  const config = getChildAgentConfig();
  const response = await volcanoFetch<ChildAgentResponse>(config.mathematicianUrl, {
    task,
    agent: 'mathematician',
    context,
  });
  return response as ChildAgentResponse;
}

/**
 * Send task to Child Agent (router between Gen Computer and Mathematician)
 * Automatically routes to the appropriate specialized agent
 */
export async function sendToChildAgent(
  task: string,
  preferredAgent?: 'gen-computer' | 'mathematician',
  context?: Record<string, unknown>
): Promise<ChildAgentResponse> {
  const config = getChildAgentConfig();
  const response = await volcanoFetch<ChildAgentResponse>(config.childAgentUrl, {
    task,
    agent: preferredAgent || 'gen-computer',
    context: {
      ...context,
      autoRoute: !preferredAgent, // Let backend decide if no preference
    },
  });
  return response as ChildAgentResponse;
}

/**
 * Stream response from any endpoint
 * Returns a ReadableStream for processing chunks
 */
export async function streamFromVolcano(
  endpoint: string,
  message: string,
  options?: Partial<VolcanoMessage>
): Promise<ReadableStream> {
  const stream = await volcanoFetch<ReadableStream>(
    endpoint,
    { message, ...options },
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

/**
 * Health check for Child Agent services
 */
export async function checkChildAgentHealth(): Promise<{
  genComputer: boolean;
  mathematician: boolean;
  childAgent: boolean;
  llmWrapper: boolean;
}> {
  const config = getChildAgentConfig();
  const { apiKey } = getVolcanoConfig();

  const checkEndpoint = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const [genComputer, mathematician, childAgent, llmWrapper] = await Promise.all([
    checkEndpoint(config.genComputerUrl),
    checkEndpoint(config.mathematicianUrl),
    checkEndpoint(config.childAgentUrl),
    checkEndpoint(config.llmWrapperUrl),
  ]);

  return { genComputer, mathematician, childAgent, llmWrapper };
}

export { VolcanoSDKError };
