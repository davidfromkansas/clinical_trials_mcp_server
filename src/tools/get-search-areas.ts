import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClinicalTrialsAPIClient } from '../api-client.js';

export const getSearchAreasTool: Tool = {
  name: 'get_available_search_filters',
  description: 'Retrieve all available search areas and filter options for querying clinical trials. Use this tool to discover what filters can be applied when searching for trials, including field names, display names, types, and possible enum values. Essential for understanding the search capabilities before constructing complex queries.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetSearchAreas(
  client: ClinicalTrialsAPIClient
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const searchAreas = await client.getSearchAreas();
  
  const areas = searchAreas.areas.map((area: any) => ({
    name: area.name,
    displayName: area.displayName,
    type: area.type,
    enumValues: area.enumValues,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ areas }, null, 2),
      },
    ],
  };
}
