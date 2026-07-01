# Devin MCP Configuration

## Adding to Devin

Devin (Autonomous AI Software Engineer) supports MCP servers for extending its capabilities. Here's how to add the ClinicalTrials MCP server using the hosted HTTP API:

### Step 1: Configure Devin

Devin's MCP configuration is typically done through project-level or workspace-level settings. Add the following to your Devin configuration file:

**For project-level configuration** (create `.devin/mcp.json` in your project):

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

**For workspace-level configuration** (in your Devin settings):

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

### Step 2: Restart Devin

After adding the configuration, restart Devin to load the MCP server.

### Step 3: Use the Tools

Once configured, you can ask Devin to:
- "Search for diabetes clinical trials"
- "Find recruiting phase 2 trials"
- "Tell me about study NCT04000009"
- "What filters can I use to search clinical trials?"
- "Help me build an app that displays clinical trial data"

### MCP Endpoint

- MCP endpoint (Streamable HTTP): `https://clinicaltrials-mcp-server-three.vercel.app/mcp`
- Health check: `https://clinicaltrials-mcp-server-three.vercel.app/health`

The server exposes these MCP tools:
- `clinicaltrials_search_studies`
- `clinicaltrials_get_study`
- `clinicaltrials_list_data_fields`
- `clinicaltrials_list_search_areas`
- `clinicaltrials_get_stats`
- `clinicaltrials_get_api_version`

### Example Devin Workflow

With the MCP server configured, Devin can:

1. **Research Phase**: Ask Devin to search for relevant clinical trials
   - "Find phase 3 diabetes trials that are recruiting"

2. **Data Analysis**: Have Devin analyze trial data
   - "Compare the eligibility criteria for these 5 trials"

3. **Application Development**: Build apps using the data
   - "Create a React app that displays clinical trial search results"

4. **Documentation**: Generate reports
   - "Write a summary of Alzheimer's disease clinical trials"

### Troubleshooting

**Server not responding**:
- Check if Devin supports HTTP transport for MCP
- Verify the URL is accessible: `curl https://clinicaltrials-mcp-server-three.vercel.app/health`
- Check Devin's MCP settings for any errors

**Tools not appearing**:
- Restart Devin after configuration
- Verify HTTP transport is supported in your Devin version
- Check Devin's MCP settings for any errors

**Alternative: Local stdio**

If Devin doesn't support HTTP transport, you can use the local stdio version:

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

### Devin-Specific Considerations

Devin may have specific requirements for MCP server configuration:
- Check Devin's documentation for the exact configuration file location
- Some configurations may need to be in workspace settings rather than project files
- Devin may require specific environment variables or permissions
