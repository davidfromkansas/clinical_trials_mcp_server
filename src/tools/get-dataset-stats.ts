import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClinicalTrialsAPIClient } from '../api-client.js';
import { jsonResult, errorResult } from '../lib/format.js';

const inputSchema = z
  .object({
    query: z
      .string()
      .optional()
      .describe('Optional search term. When provided, returns the count of studies matching it.'),
  })
  .strict();

const outputSchema = {
  totalCount: z.number().optional(),
  averageSizeBytes: z.number().optional(),
  largestStudies: z.array(z.any()).optional(),
  raw: z.any().optional(),
};

export function registerGetStats(server: McpServer, client: ClinicalTrialsAPIClient): void {
  server.registerTool(
    'clinicaltrials_get_stats',
    {
      title: 'Get Database Statistics',
      description:
        'Retrieve ClinicalTrials.gov dataset statistics (e.g. total number of studies). Optionally scope to a search term to get a match count. Useful for gauging dataset scale or validating expected result counts.',
      inputSchema,
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ query }) => {
      try {
        const stats = (await client.getDatasetStats(query)) as unknown as Record<string, unknown>;
        return jsonResult({
          totalCount: (stats.totalCount as number) ?? undefined,
          averageSizeBytes: (stats.averageSizeBytes as number) ?? undefined,
          largestStudies: (stats.largestStudies as unknown[]) ?? undefined,
          raw: stats,
        });
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
      }
    }
  );
}
