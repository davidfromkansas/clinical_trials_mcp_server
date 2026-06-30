import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ClinicalTrialsAPIClient } from './api-client.js';
import {
  searchStudiesTool,
  handleSearchStudies,
} from './tools/search-studies.js';
import {
  getStudyTool,
  handleGetStudy,
} from './tools/get-study.js';
import {
  getStudyFieldsTool,
  handleGetStudyFields,
} from './tools/get-study-fields.js';
import {
  getSearchAreasTool,
  handleGetSearchAreas,
} from './tools/get-search-areas.js';
import {
  getDatasetStatsTool,
  handleGetDatasetStats,
} from './tools/get-dataset-stats.js';
import {
  getAPIVersionTool,
  handleGetAPIVersion,
} from './tools/get-api-version.js';

const client = new ClinicalTrialsAPIClient();

const server = new Server(
  {
    name: 'clinicaltrials-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      searchStudiesTool,
      getStudyTool,
      getStudyFieldsTool,
      getSearchAreasTool,
      getDatasetStatsTool,
      getAPIVersionTool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_clinical_trials_by_criteria':
        return await handleSearchStudies(client, args);
      case 'retrieve_detailed_study_by_nct_id':
        return await handleGetStudy(client, args);
      case 'get_available_data_fields_metadata':
        return await handleGetStudyFields(client);
      case 'get_available_search_filters':
        return await handleGetSearchAreas(client);
      case 'get_database_statistics':
        return await handleGetDatasetStats(client, args);
      case 'get_api_version_info':
        return await handleGetAPIVersion(client);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ClinicalTrials.gov MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
