import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClinicalTrialsAPIClient } from '../api-client.js';
import { jsonResult, errorResult } from '../lib/format.js';

const outputSchema = {
  areas: z.array(
    z.object({
      name: z.string().optional(),
      displayName: z.string().optional(),
      type: z.string().optional(),
      enumValues: z.array(z.any()).optional(),
    })
  ),
};

export function registerListSearchAreas(server: McpServer, client: ClinicalTrialsAPIClient): void {
  server.registerTool(
    'clinicaltrials_list_search_areas',
    {
      title: 'List Search Areas & Filters',
      description:
        'List the search areas and filter options available when querying ClinicalTrials.gov (field names, display names, types, enum values). Use to discover valid filters before constructing complex searches.',
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
        const searchAreas = await client.getSearchAreas();
        const areas = (searchAreas.areas || []).map((area: any) => ({
          name: area?.name,
          displayName: area?.displayName,
          type: area?.type,
          enumValues: area?.enumValues,
        }));
        return jsonResult({ areas });
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
      }
    }
  );
}
