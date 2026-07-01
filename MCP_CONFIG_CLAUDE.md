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
      "url": "https://clinicaltrials-mcp-server-three.vercel.app",
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
      "url": "https://clinicaltrials-mcp-server-three.vercel.app",
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

### Available Endpoints

The hosted API provides the following endpoints:
- Health check: https://clinicaltrials-mcp-server-three.vercel.app/health
- Tools list: https://clinicaltrials-mcp-server-three.vercel.app/tools
- Search trials: POST https://clinicaltrials-mcp-server-three.vercel.app/tools/search_clinical_trials_by_criteria
- Get study: POST https://clinicaltrials-mcp-server-three.vercel.app/tools/retrieve_detailed_study_by_nct_id
- Get fields: GET https://clinicaltrials-mcp-server-three.vercel.app/tools/get_available_data_fields_metadata
- Get filters: GET https://clinicaltrials-mcp-server-three.vercel.app/tools/get_available_search_filters
- Get stats: POST https://clinicaltrials-mcp-server-three.vercel.app/tools/get_database_statistics
- API version: GET https://clinicaltrials-mcp-server-three.vercel.app/tools/get_api_version_info

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
