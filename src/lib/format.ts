import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Maximum number of characters returned in a tool's text content. Large payloads
 * are truncated with a clear message so agents don't blow their context window.
 */
export const CHARACTER_LIMIT = 25000;

/**
 * Build a successful tool result. Returns the data as pretty JSON text and, when
 * an output schema is declared for the tool, as structuredContent for clients that
 * can consume it. Text longer than CHARACTER_LIMIT is truncated with guidance.
 */
export function jsonResult(
  data: Record<string, unknown>,
  options: { hint?: string } = {}
): CallToolResult {
  let text = JSON.stringify(data, null, 2);

  if (text.length > CHARACTER_LIMIT) {
    const hint =
      options.hint ??
      'Response truncated. Use a smaller pageSize or more specific filters to reduce the result size.';
    text = `${text.slice(0, CHARACTER_LIMIT)}\n\n... [truncated at ${CHARACTER_LIMIT} characters]. ${hint}`;
  }

  return {
    content: [{ type: 'text', text }],
    structuredContent: data,
  };
}

/**
 * Build an error tool result with an actionable message. Errors are reported
 * inside the result (isError: true) rather than thrown, per MCP guidance.
 */
export function errorResult(message: string): CallToolResult {
  return {
    isError: true,
    content: [{ type: 'text', text: `Error: ${message}` }],
  };
}
