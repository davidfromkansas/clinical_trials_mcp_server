import express, { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp-server.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Handle an MCP request in stateless mode: a fresh server + transport per request.
// This works cleanly on serverless platforms like Vercel where state is not shared.
async function handleMcpRequest(req: Request, res: Response) {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
}

// MCP endpoint (Streamable HTTP transport). Clients POST JSON-RPC messages here.
app.post('/mcp', handleMcpRequest);
app.post('/', handleMcpRequest);

// Stateless mode does not support server-initiated SSE streams or session termination.
function methodNotAllowed(_req: Request, res: Response) {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed. Use POST for MCP requests.' },
    id: null,
  });
}

app.get('/mcp', methodNotAllowed);
app.delete('/mcp', methodNotAllowed);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Start server for local development
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`MCP HTTP Server running on port ${PORT}`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel
export default app;
