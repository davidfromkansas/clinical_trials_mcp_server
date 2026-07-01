import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClinicalTrialsAPIClient } from '../api-client.js';
import { jsonResult, errorResult } from '../lib/format.js';

const outputSchema = {
  fields: z.array(
    z.object({
      name: z.string().optional(),
      type: z.string().optional(),
      description: z.string().optional(),
      enumValues: z.array(z.any()).optional(),
    })
  ),
};

export function registerListDataFields(server: McpServer, client: ClinicalTrialsAPIClient): void {
  server.registerTool(
    'clinicaltrials_list_data_fields',
    {
      title: 'List Available Data Fields',
      description:
        'List the data fields available in ClinicalTrials.gov study records (name, type, description, enum values). Use to understand the schema of study data before requesting specific studies.',
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const metadata = await client.getStudyFields();
        const fields = (metadata.fields || []).map((field: any) => ({
          name: field?.name,
          type: field?.type,
          description: field?.description,
          enumValues: field?.enumValues,
        }));
        return jsonResult({ fields });
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
      }
    }
  );
}
