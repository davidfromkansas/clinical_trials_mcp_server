import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClinicalTrialsAPIClient } from '../api-client.js';
import { jsonResult, errorResult } from '../lib/format.js';

const outputSchema = {
  apiVersion: z.string().optional(),
  dataTimestamp: z.string().optional(),
};

export function registerGetApiVersion(server: McpServer, client: ClinicalTrialsAPIClient): void {
  server.registerTool(
    'clinicaltrials_get_api_version',
    {
      title: 'Get API Version',
      description:
        'Retrieve the ClinicalTrials.gov API version and data timestamp. Use for compatibility checks or debugging.',
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
        const version = (await client.getAPIVersion()) as unknown as Record<string, unknown>;
        return jsonResult({
          apiVersion: (version.apiVersion as string) ?? undefined,
          dataTimestamp: (version.dataTimestamp as string) ?? undefined,
        });
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
      }
    }
  );
}
