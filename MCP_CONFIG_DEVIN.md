# Devin MCP Configuration

## Adding to Devin

Devin (Autonomous AI Software Engineer) supports MCP servers for extending its capabilities. Here's how to add the ClinicalTrials MCP server:

### Step 1: Clone or Download the Server

If you haven't already, clone the repository:

```bash
git clone https://github.com/davidfromkansas/clinical_trials_mcp_server.git
cd clinical_trials_mcp_server
npm install
npm run build
```

### Step 2: Configure Devin

Devin's MCP configuration is typically done through project-level or workspace-level settings. Add the following to your Devin configuration file:

**For project-level configuration** (create `.devin/mcp.json` in your project):

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

**For workspace-level configuration** (in your Devin settings):

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

### Step 3: Restart Devin

After adding the configuration, restart Devin to load the MCP server.

### Step 4: Use the Tools

Once configured, you can ask Devin to:
- "Search for diabetes clinical trials"
- "Find recruiting phase 2 trials"
- "Tell me about study NCT04000009"
- "What filters can I use to search clinical trials?"
- "Help me build an app that displays clinical trial data"

### Alternative: Use HTTP API

If you prefer to use the HTTP API instead of local stdio, you can configure Devin to use the Vercel endpoint:

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

Note: HTTP transport support depends on Devin's current MCP implementation. If not supported, use the stdio configuration above.

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

**Server not starting**:
- Ensure Node.js is installed: `node --version`
- Verify the path to `dist/server.js` is correct
- Check that dependencies are installed: `npm install`
- Build the project: `npm run build`

**Tools not appearing**:
- Restart Devin after configuration
- Check Devin's MCP settings for any errors
- Verify the server runs locally: `npm run start:stdio`

**Path issues**:
- Use absolute paths in the configuration
- On macOS, paths start with `/Users/yourname/...`
- On Windows, paths use backslashes or forward slashes

### Devin-Specific Considerations

Devin may have specific requirements for MCP server configuration:
- Check Devin's documentation for the exact configuration file location
- Some configurations may need to be in workspace settings rather than project files
- Devin may require specific environment variables or permissions
