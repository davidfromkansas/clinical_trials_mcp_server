import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClinicalTrialsAPIClient } from '../api-client.js';
import { jsonResult, errorResult } from '../lib/format.js';

const inputSchema = z
  .object({
    nctId: z
      .string()
      .regex(/^NCT[0-9]+$/i, 'Must be "NCT" followed by numbers, e.g. NCT04000009.')
      .describe('ClinicalTrials.gov identifier (e.g. NCT04000009).'),
  })
  .strict();

const outputSchema = {
  nctId: z.string(),
  title: z.string().optional(),
  officialTitle: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),
  conditions: z.array(z.string()),
  sponsor: z.string().optional(),
  eligibilityCriteria: z.string().optional(),
  healthyVolunteers: z.boolean().optional(),
  sex: z.string().optional(),
  minimumAge: z.string().optional(),
  maximumAge: z.string().optional(),
  interventions: z.array(z.object({ type: z.string().optional(), name: z.string().optional() })),
  locations: z.array(
    z.object({
      facility: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      status: z.string(),
    })
  ),
};

export function registerGetStudy(server: McpServer, client: ClinicalTrialsAPIClient): void {
  server.registerTool(
    'clinicaltrials_get_study',
    {
      title: 'Get Clinical Trial Details',
      description:
        'Retrieve full details for a single clinical trial by its NCT ID: title, status, dates, conditions, sponsor, eligibility criteria, interventions, and study locations. Use after clinicaltrials_search_studies when you have a specific NCT ID.',
      inputSchema,
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ nctId }) => {
      try {
        const study = await client.getStudy(nctId);
        const p = study.protocolSection;

        const summary = {
          nctId: p?.identificationModule?.nctId || nctId,
          title: p?.identificationModule?.briefTitle,
          officialTitle: p?.identificationModule?.officialTitle,
          status: p?.statusModule?.overallStatus,
          startDate: p?.statusModule?.startDateStruct?.date,
          completionDate: p?.statusModule?.completionDateStruct?.date,
          conditions: (p?.conditionsModule?.conditions || [])
            .map((c: any) => (typeof c === 'string' ? c : c?.name))
            .filter(Boolean),
          sponsor: p?.sponsorCollaboratorsModule?.leadSponsor?.name,
          eligibilityCriteria: p?.eligibilityModule?.eligibilityCriteria,
          healthyVolunteers: p?.eligibilityModule?.healthyVolunteers,
          sex: p?.eligibilityModule?.sex ?? p?.eligibilityModule?.gender,
          minimumAge: p?.eligibilityModule?.minimumAge,
          maximumAge: p?.eligibilityModule?.maximumAge,
          interventions: (p?.armsInterventionsModule?.interventions || []).map((i: any) => ({
            type: i?.interventionType,
            name: i?.name,
          })),
          locations: (p?.contactsLocationsModule?.locations || []).map((l: any) => ({
            facility: l?.facility || 'Unknown',
            city: l?.city || 'Unknown',
            state: l?.state || 'Unknown',
            country: l?.country || 'Unknown',
            status: l?.status || 'Unknown',
          })),
        };

        return jsonResult(summary);
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
      }
    }
  );
}
