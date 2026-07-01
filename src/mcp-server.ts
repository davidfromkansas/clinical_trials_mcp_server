import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ClinicalTrialsAPIClient } from './api-client.js';
import { registerSearchStudies } from './tools/search-studies.js';
import { registerGetStudy } from './tools/get-study.js';
import { registerListDataFields } from './tools/get-study-fields.js';
import { registerListSearchAreas } from './tools/get-search-areas.js';
import { registerGetStats } from './tools/get-dataset-stats.js';
import { registerGetApiVersion } from './tools/get-api-version.js';
import { registerSearchStudiesMap } from './tools/search-studies-map.js';

export function createMcpServer(): McpServer {
  const client = new ClinicalTrialsAPIClient();

  const server = new McpServer({
    name: 'clinicaltrials-mcp-server',
    version: '1.0.0',
  });

  registerSearchStudies(server, client);
  registerGetStudy(server, client);
  registerListDataFields(server, client);
  registerListSearchAreas(server, client);
  registerGetStats(server, client);
  registerGetApiVersion(server, client);
  registerSearchStudiesMap(server, client);

  return server;
}
