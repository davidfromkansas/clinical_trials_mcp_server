import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClinicalTrialsAPIClient } from '../api-client.js';

export const getStudyFieldsTool: Tool = {
  name: 'get_available_data_fields_metadata',
  description: 'Retrieve metadata about all data fields available in ClinicalTrials.gov study records. Use this tool to understand the structure of study data, including field names, types, descriptions, and possible enum values. Helpful for understanding what information is available in trial records before querying specific studies.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetStudyFields(
  client: ClinicalTrialsAPIClient
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const metadata = await client.getStudyFields();
  
  const fields = metadata.fields.map((field: any) => ({
    name: field.name,
    type: field.type,
    description: field.description,
    enumValues: field.enumValues,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ fields }, null, 2),
      },
    ],
  };
}
