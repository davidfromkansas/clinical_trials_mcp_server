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

### Local Development (HTTP API)

```bash
npm start
```

The HTTP API will be available at:
- Health check: `http://localhost:3000/health`
- Tools list: `http://localhost:3000/tools`
- Tool endpoints: `http://localhost:3000/tools/{tool_name}`

### Local Development (MCP stdio)

For local MCP client integration via stdio:

```bash
npm run start:stdio
```

## Deployment

### Vercel (HTTP API)

The server is deployed on Vercel at:
- **Production**: https://clinicaltrials-mcp-server-three.vercel.app
- **Health check**: https://clinicaltrials-mcp-server-three.vercel.app/health
- **Tools list**: https://clinicaltrials-mcp-server-three.vercel.app/tools

### MCP Configuration

#### For HTTP API (Vercel)

Configure your MCP client to use the HTTP endpoints:

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

### search_studies

Search clinical trials with filters.

**Parameters:**
- `queryTerm` (string, optional): Full-text search term
- `status` (string, optional): Trial status (RECRUITING, COMPLETED, ACTIVE_NOT_RECRUITING, etc.)
- `phase` (string, optional): Clinical trial phase (PHASE1, PHASE2, PHASE3, etc.)
- `condition` (string, optional): Medical condition or disease
- `intervention` (string, optional): Intervention or treatment type
- `leadSponsor` (string, optional): Lead sponsor name
- `studyType` (string, optional): Study type (INTERVENTIONAL, OBSERVATIONAL, EXPANDED_ACCESS)
- `pageSize` (number, optional): Results per page (1-1000, default: 50)
- `pageToken` (string, optional): Pagination token for next page

**Example:**
```json
{
  "queryTerm": "diabetes",
  "status": "RECRUITING",
  "phase": "PHASE2",
  "pageSize": 10
}
```

### get_study

Get detailed information about a specific clinical trial by NCT ID.

**Parameters:**
- `nctId` (string, required): ClinicalTrials.gov identifier (e.g., "NCT04000009")

**Example:**
```json
{
  "nctId": "NCT04000009"
}
```

### get_study_fields

Get metadata about all available data fields in ClinicalTrials.gov study records.

**Parameters:** None

### get_search_areas

Get available search areas and filters for querying clinical trials.

**Parameters:** None

### get_dataset_stats

Get statistics about the ClinicalTrials.gov database.

**Parameters:**
- `queryTerm` (string, optional): Query term to filter statistics

### get_api_version

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
