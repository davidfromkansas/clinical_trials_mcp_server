# ClinicalTrials.gov MCP Server

A Model Context Protocol (MCP) server that provides access to the ClinicalTrials.gov API v2, enabling AI assistants to search and retrieve clinical trial data.

## Features

- **Search clinical trials** with filters (status, phase, condition, intervention, sponsor, study type)
- **Get detailed study information** by NCT ID
- **Retrieve field metadata** for available data fields
- **Get search areas** and available filters
- **Query dataset statistics**
- **API version information**

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Running

### Local Development (MCP over HTTP)

```bash
npm start
```

The MCP server (Streamable HTTP transport) will be available at:
- MCP endpoint: `http://localhost:3000/mcp`
- Health check: `http://localhost:3000/health`

### Local Development (MCP stdio)

For local MCP client integration via stdio:

```bash
npm run start:stdio
```

## Deployment

### Vercel (MCP over HTTP)

The server is deployed on Vercel as a remote MCP server (Streamable HTTP transport):
- **MCP endpoint**: https://clinicaltrials-mcp-server-three.vercel.app/mcp
- **Health check**: https://clinicaltrials-mcp-server-three.vercel.app/health

### MCP Configuration

#### For Remote MCP (Vercel)

Configure your MCP client to use the hosted MCP endpoint:

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

See `MCP_CONFIG_CLAUDE.md`, `MCP_CONFIG_CURSOR.md`, and `MCP_CONFIG_DEVIN.md` for client-specific setup.

#### For Local stdio

Add this server to your MCP client configuration:

```json
{
  "mcpServers": {
    "clinicaltrials": {
      "command": "node",
      "args": ["/path/to/clinicaltrials-mcp-server/dist/server.js"]
    }
  }
}
```

## Available Tools

All tools are read-only (annotated `readOnlyHint: true`) and return both text and `structuredContent`.

### clinicaltrials_search_studies

Search clinical trials with filters. Returns paginated summaries plus an accurate `totalCount` and `hasMore` flag.

**Parameters:**
- `query` (string, optional): Full-text search term (maps to `query.term`)
- `status` (enum, optional): Recruitment status (RECRUITING, COMPLETED, ACTIVE_NOT_RECRUITING, etc.)
- `phase` (enum, optional): EARLY_PHASE1, PHASE1, PHASE2, PHASE3, PHASE4
- `condition` (string, optional): Medical condition or disease (maps to `query.cond`)
- `intervention` (string, optional): Intervention or treatment (maps to `query.intr`)
- `leadSponsor` (string, optional): Lead sponsor name (maps to `query.spons`)
- `studyType` (enum, optional): INTERVENTIONAL, OBSERVATIONAL, EXPANDED_ACCESS
- `pageSize` (number, optional): Results per page (1-1000, default: 20)
- `pageToken` (string, optional): Pagination token for the next page

**Example:**
```json
{
  "query": "diabetes",
  "status": "RECRUITING",
  "phase": "PHASE2",
  "pageSize": 10
}
```

### clinicaltrials_get_study

Get detailed information about a specific clinical trial by NCT ID.

**Parameters:**
- `nctId` (string, required): ClinicalTrials.gov identifier (e.g., "NCT04000009")

**Example:**
```json
{
  "nctId": "NCT04000009"
}
```

### clinicaltrials_list_data_fields

List the available data fields in ClinicalTrials.gov study records.

**Parameters:** None

### clinicaltrials_list_search_areas

List available search areas and filters for querying clinical trials.

**Parameters:** None

### clinicaltrials_get_stats

Get statistics about the ClinicalTrials.gov database.

**Parameters:**
- `query` (string, optional): Search term to scope the statistics

### clinicaltrials_get_api_version

Get the ClinicalTrials.gov API version information.

**Parameters:** None

## API Reference

This server uses the [ClinicalTrials.gov Data API v2](https://clinicaltrials.gov/data-api/api), which is a public, unauthenticated REST API.

**Base URL:** `https://clinicaltrials.gov/api/v2`

## Project Structure

```
clinicaltrials-mcp-server/
├── src/
│   ├── api-client.ts          # ClinicalTrials.gov API client
│   ├── server.ts              # MCP server setup
│   ├── index.ts               # Main entry point
│   ├── types/
│   │   └── api.ts             # TypeScript type definitions
│   └── tools/
│       ├── search-studies.ts
│       ├── get-study.ts
│       ├── get-study-fields.ts
│       ├── get-search-areas.ts
│       ├── get-dataset-stats.ts
│       └── get-api-version.ts
├── dist/                      # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Development

This project uses:
- **TypeScript** for type safety
- **@modelcontextprotocol/sdk** for MCP server implementation
- **Node.js** runtime

## License

ISC
