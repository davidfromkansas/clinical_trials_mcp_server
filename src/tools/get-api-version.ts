import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClinicalTrialsAPIClient } from '../api-client.js';

export const getAPIVersionTool: Tool = {
  name: 'get_api_version_info',
  description: 'Retrieve the current version information for the ClinicalTrials.gov API. Use this tool to check API version for compatibility or debugging purposes. Returns version number and API metadata.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetAPIVersion(
  client: ClinicalTrialsAPIClient
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const version = await client.getAPIVersion();

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(version, null, 2),
      },
    ],
  };
}
