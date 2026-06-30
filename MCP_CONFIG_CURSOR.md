# Cursor MCP Configuration

## Adding to Cursor

Cursor supports MCP servers through its settings. Here's how to add the ClinicalTrials MCP server:

### Step 1: Clone or Download the Server

If you haven't already, clone the repository:

```bash
git clone https://github.com/davidfromkansas/clinical_trials_mcp_server.git
cd clinical_trials_mcp_server
npm install
npm run build
```

### Step 2: Configure Cursor

1. Open Cursor
2. Go to Settings (Cmd+, or Ctrl+,)
3. Navigate to "MCP Servers" or "Model Context Protocol"
4. Add a new server with the following configuration:

```json
{
  "mcpServers": {
    "clinicaltrials": {
      "command": "node",
      "args": ["/Users/david_lietjauw/CascadeProjects/clinicaltrials-mcp-server/dist/server.js"]
    }
  }
}
```

**Important**: Update the path to match your actual local path to the `dist/server.js` file.

### Step 3: Restart Cursor

After adding the configuration, restart Cursor to load the MCP server.

### Step 4: Use the Tools

Once configured, you can ask Cursor to:
- "Search for diabetes clinical trials"
- "Find recruiting phase 2 trials"
- "Tell me about study NCT04000009"
- "What filters can I use to search clinical trials?"

### Alternative: Use HTTP API

If you prefer to use the HTTP API instead of local stdio, you can configure Cursor to use the Vercel endpoint (if Cursor supports HTTP transport):

```json
{
  "mcpServers": {
    "clinicaltrials": {
      "url": "https://clinicaltrials-mcp-server-three.vercel.app",
      "transport": "http"
    }
  }
}
```

Note: HTTP transport support depends on Cursor's current MCP implementation. If not supported, use the stdio configuration above.

### Troubleshooting

**Server not starting**:
- Ensure Node.js is installed: `node --version`
- Verify the path to `dist/server.js` is correct
- Check that dependencies are installed: `npm install`
- Build the project: `npm run build`

**Tools not appearing**:
- Restart Cursor after configuration
- Check Cursor's MCP settings for any errors
- Verify the server runs locally: `npm run start:stdio`

**Path issues**:
- Use absolute paths in the configuration
- On macOS, paths start with `/Users/yourname/...`
- On Windows, paths use backslashes or forward slashes
