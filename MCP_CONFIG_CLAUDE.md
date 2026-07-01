# Claude Desktop MCP Configuration

## Adding to Claude Desktop

Claude Desktop supports MCP servers through its configuration file. Here's how to add the ClinicalTrials MCP server using the hosted HTTP API:

### Step 1: Locate Claude Desktop Config

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

### Step 2: Add MCP Server Configuration

Open the config file and add the ClinicalTrials server:

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

If you already have other MCP servers configured, add it to the existing `mcpServers` object:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    },
    "clinicaltrials": {
      "url": "https://clinicaltrials-mcp-server-three.vercel.app/mcp",
      "transport": "http"
    }
  }
}
```

### Step 3: Restart Claude Desktop

After saving the config file, restart Claude Desktop to load the MCP server.

### Step 4: Use the Tools

Once configured, you can ask Claude to:
- "Search for diabetes clinical trials"
- "Find recruiting phase 2 trials"
- "Tell me about study NCT04000009"
- "What filters can I use to search clinical trials?"
- "Show me trials for breast cancer that are currently recruiting"

### Using the Claude Web Custom Connector

On claude.ai, use **Settings > Connectors > Add custom connector** and fill in:
- **Name**: `ClinicalTrials`
- **Remote MCP server URL**: `https://clinicaltrials-mcp-server-three.vercel.app/mcp`
- **OAuth Client ID / Secret**: leave blank (this server does not require auth)

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

### Troubleshooting

**Server not responding**:
- Check if Claude Desktop supports HTTP transport for MCP
- Verify the URL is accessible: `curl https://clinicaltrials-mcp-server-three.vercel.app/health`
- Check Claude Desktop logs for any errors

**Tools not appearing**:
- Restart Claude Desktop after configuration
- Verify the config file JSON is valid (no syntax errors)
- Check Claude Desktop logs for any errors

**Config file location**:
- macOS: Use `Cmd+Shift+G` in Finder and paste the path
- Windows: Press `Win+R` and paste the path

**Alternative: Local stdio**

If Claude Desktop doesn't support HTTP transport, you can use the local stdio version:

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

### Example Usage

With the MCP server configured, you can ask Claude:

**Research**:
- "Find phase 3 diabetes trials that are recruiting"
- "Search for Alzheimer's disease clinical trials"
- "What cancer trials are recruiting in California?"

**Analysis**:
- "Compare the eligibility criteria for these 5 trials"
- "Summarize the interventions used in these cardiology trials"
- "What are the common inclusion criteria across these studies?"

**Data Extraction**:
- "Get detailed information about study NCT04000009"
- "Show me the locations for this clinical trial"
- "What are the eligibility criteria for this study?"
