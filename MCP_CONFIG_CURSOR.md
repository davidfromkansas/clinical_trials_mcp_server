# Cursor MCP Configuration

## Adding to Cursor

Cursor supports MCP servers through its settings. Here's how to add the ClinicalTrials MCP server using the hosted HTTP API:

### Step 1: Configure Cursor

1. Open Cursor
2. Go to Settings (Cmd+, or Ctrl+,)
3. Navigate to "MCP Servers" or "Model Context Protocol"
4. Add a new server with the following configuration:

```json
{
  "mcpServers": {
    "clinicaltrials": {
      "url": "https://clinicaltrials-mcp-server-three.vercel.app/mcp",
      "transport": "http"
    }
  }
}
```

### Step 2: Restart Cursor

After adding the configuration, restart Cursor to load the MCP server.

### Step 3: Use the Tools

Once configured, you can ask Cursor to:
- "Search for diabetes clinical trials"
- "Find recruiting phase 2 trials"
- "Tell me about study NCT04000009"
- "What filters can I use to search clinical trials?"

### MCP Endpoint

- MCP endpoint (Streamable HTTP): `https://clinicaltrials-mcp-server-three.vercel.app/mcp`
- Health check: `https://clinicaltrials-mcp-server-three.vercel.app/health`

The server exposes these MCP tools:
- `search_clinical_trials_by_criteria`
- `retrieve_detailed_study_by_nct_id`
- `get_available_data_fields_metadata`
- `get_available_search_filters`
- `get_database_statistics`
- `get_api_version_info`

### Troubleshooting

**Server not responding**:
- Check if Cursor supports HTTP transport for MCP
- Verify the URL is accessible: `curl https://clinicaltrials-mcp-server-three.vercel.app/health`
- Check Cursor's MCP settings for any errors

**Tools not appearing**:
- Restart Cursor after configuration
- Verify HTTP transport is supported in your Cursor version
- Check Cursor's MCP settings for any errors

**Alternative: Local stdio**

If Cursor doesn't support HTTP transport, you can use the local stdio version:

```bash
git clone https://github.com/davidfromkansas/clinical_trials_mcp_server.git
cd clinical_trials_mcp_server
npm install
npm run build
```

Then configure:

```json
{
  "mcpServers": {
    "clinicaltrials": {
      "command": "node",
      "args": ["/absolute/path/to/clinicaltrials-mcp-server/dist/server.js"]
    }
  }
}
```
