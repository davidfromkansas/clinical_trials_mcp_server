import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClinicalTrialsAPIClient } from '../api-client.js';
import { jsonResult, errorResult } from '../lib/format.js';

const STATUS_VALUES = [
  'RECRUITING',
  'ACTIVE_NOT_RECRUITING',
  'COMPLETED',
  'ENROLLING_BY_INVITATION',
  'NOT_YET_RECRUITING',
  'SUSPENDED',
  'TERMINATED',
  'WITHDRAWN',
  'AVAILABLE',
  'NO_LONGER_AVAILABLE',
  'TEMPORARILY_NOT_AVAILABLE',
  'APPROVED_FOR_MARKETING',
  'WITHHELD',
  'UNKNOWN',
] as const;

const inputSchema = z
  .object({
    query: z
      .string()
      .optional()
      .describe('Full-text search term (e.g. "diabetes", "cancer immunotherapy"). Maps to query.term.'),
    status: z
      .enum(STATUS_VALUES)
      .optional()
      .describe('Filter by recruitment status. Use RECRUITING for trials currently enrolling.'),
    phase: z
      .enum(['EARLY_PHASE1', 'PHASE1', 'PHASE2', 'PHASE3', 'PHASE4'])
      .optional()
      .describe('Filter by trial phase. PHASE1 = safety, PHASE2 = efficacy, PHASE3 = comparison to standard care.'),
    condition: z
      .string()
      .optional()
      .describe('Medical condition or disease (e.g. "Type 2 Diabetes"). Maps to query.cond.'),
    intervention: z
      .string()
      .optional()
      .describe('Intervention or treatment name (e.g. "aspirin", "immunotherapy"). Maps to query.intr.'),
    leadSponsor: z
      .string()
      .optional()
      .describe('Lead sponsor organization name (e.g. "Pfizer"). Maps to query.spons.'),
    studyType: z
      .enum(['INTERVENTIONAL', 'OBSERVATIONAL', 'EXPANDED_ACCESS'])
      .optional()
      .describe('Study design type. INTERVENTIONAL tests treatments; OBSERVATIONAL tracks outcomes.'),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .default(20)
      .describe('Results per page (1-1000). Use 10-50 for fast responses.'),
    pageToken: z
      .string()
      .optional()
      .describe('Pagination token from a previous response to fetch the next page.'),
  })
  .strict();

const outputSchema = {
  studies: z.array(
    z.object({
      nctId: z.string(),
      title: z.string(),
      status: z.string(),
      conditions: z.array(z.string()),
      sponsor: z.string(),
    })
  ),
  totalCount: z.number(),
  count: z.number(),
  hasMore: z.boolean(),
  nextPageToken: z.string().optional(),
};

export function registerSearchStudies(server: McpServer, client: ClinicalTrialsAPIClient): void {
  server.registerTool(
    'clinicaltrials_search_studies',
    {
      title: 'Search Clinical Trials',
      description:
        'Search ClinicalTrials.gov for trials matching criteria such as condition, intervention, sponsor, recruitment status, phase, and study type. Returns paginated summaries (NCT ID, title, status, conditions, sponsor) plus a total match count. Example result: {"studies":[{"nctId":"NCT01234567","title":"...","status":"RECRUITING","conditions":["Diabetes"],"sponsor":"..."}],"totalCount":342,"count":20,"hasMore":true,"nextPageToken":"..."}.',
      inputSchema,
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const response = await client.searchStudies(args);
        const studies = (response.studies || []).map((study: any) => ({
          nctId: study.protocolSection?.identificationModule?.nctId || 'Unknown',
          title: study.protocolSection?.identificationModule?.briefTitle || 'Unknown',
          status: study.protocolSection?.statusModule?.overallStatus || 'Unknown',
          conditions: (study.protocolSection?.conditionsModule?.conditions || [])
            .map((c: any) => (typeof c === 'string' ? c : c?.name))
            .filter(Boolean),
          sponsor:
            study.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name || 'Unknown',
        }));

        return jsonResult({
          studies,
          totalCount: response.totalCount ?? 0,
          count: studies.length,
          hasMore: Boolean(response.nextPageToken),
          nextPageToken: response.nextPageToken,
        });
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
      }
    }
  );
}
