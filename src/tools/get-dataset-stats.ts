import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClinicalTrialsAPIClient } from '../api-client.js';

export const getDatasetStatsTool: Tool = {
  name: 'get_database_statistics',
  description: 'Retrieve statistics about the ClinicalTrials.gov database, including total number of studies. Use this tool to understand the scale of available data or to get counts for specific search terms. Helpful for providing context about the database size or validating search result expectations.',
  inputSchema: {
    type: 'object',
    properties: {
      queryTerm: {
        type: 'string',
        description: 'Optional search term to filter statistics. When provided, returns count of studies matching the query term',
      },
    },
  },
};

export async function handleGetDatasetStats(
  client: ClinicalTrialsAPIClient,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const stats = await client.getDatasetStats(args.queryTerm);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(stats, null, 2),
      },
    ],
  };
}
