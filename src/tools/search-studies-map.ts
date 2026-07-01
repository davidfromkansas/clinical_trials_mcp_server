import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import { ClinicalTrialsAPIClient, SearchStudiesParams } from '../api-client.js';
import { MAP_HTML } from '../ui/map-html.js';
import { errorResult } from '../lib/format.js';

const MAP_RESOURCE_URI = 'ui://clinicaltrials/map';

// Origins the map widget is allowed to load from (Leaflet + tiles + the App bridge).
const RESOURCE_DOMAINS = [
  'https://unpkg.com',
  'https://a.basemaps.cartocdn.com',
  'https://b.basemaps.cartocdn.com',
  'https://c.basemaps.cartocdn.com',
  'https://d.basemaps.cartocdn.com',
  'https://esm.sh',
];

const STATUS_VALUES = [
  'RECRUITING',
  'ACTIVE_NOT_RECRUITING',
  'COMPLETED',
  'ENROLLING_BY_INVITATION',
  'NOT_YET_RECRUITING',
  'SUSPENDED',
  'TERMINATED',
  'WITHDRAWN',
] as const;

const inputSchema = {
  query: z.string().optional().describe('Full-text search term (maps to query.term).'),
  condition: z.string().optional().describe('Medical condition or disease (maps to query.cond).'),
  intervention: z.string().optional().describe('Intervention or treatment (maps to query.intr).'),
  leadSponsor: z.string().optional().describe('Lead sponsor organization (maps to query.spons).'),
  country: z
    .string()
    .optional()
    .describe('Location term such as a country or city to focus the map (maps to query.locn).'),
  status: z.enum(STATUS_VALUES).optional().describe('Filter by recruitment status.'),
  phase: z
    .enum(['EARLY_PHASE1', 'PHASE1', 'PHASE2', 'PHASE3', 'PHASE4'])
    .optional()
    .describe('Filter by trial phase.'),
  studyType: z
    .enum(['INTERVENTIONAL', 'OBSERVATIONAL', 'EXPANDED_ACCESS'])
    .optional()
    .describe('Filter by study design type.'),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(200)
    .default(50)
    .describe('Number of trials to plot (1-200). Larger values show more markers.'),
};

const locationSchema = z.object({
  facility: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  status: z.string(),
  lat: z.number(),
  lon: z.number(),
});

const studySchema = z.object({
  nctId: z.string(),
  title: z.string(),
  status: z.string(),
  phase: z.string(),
  sponsor: z.string(),
  conditions: z.array(z.string()),
  locations: z.array(locationSchema),
});

const outputSchema = {
  query: z.record(z.string(), z.any()),
  totalCount: z.number(),
  count: z.number(),
  mappedSites: z.number(),
  studies: z.array(studySchema),
};

type MapStudy = z.infer<typeof studySchema>;

function toMapStudy(study: any): MapStudy {
  const p = study.protocolSection || {};
  const locations = (p.contactsLocationsModule?.locations || [])
    .filter((l: any) => l?.geoPoint && typeof l.geoPoint.lat === 'number')
    .map((l: any) => ({
      facility: l.facility || 'Unknown',
      city: l.city || '',
      state: l.state || '',
      country: l.country || '',
      status: l.status || '',
      lat: l.geoPoint.lat,
      lon: l.geoPoint.lon,
    }));

  return {
    nctId: p.identificationModule?.nctId || 'Unknown',
    title: p.identificationModule?.briefTitle || 'Unknown',
    status: p.statusModule?.overallStatus || '',
    phase: (p.designModule?.phases || []).join(', '),
    sponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name || '',
    conditions: (p.conditionsModule?.conditions || [])
      .map((c: any) => (typeof c === 'string' ? c : c?.name))
      .filter(Boolean),
    locations,
  };
}

export function registerSearchStudiesMap(server: McpServer, client: ClinicalTrialsAPIClient): void {
  // The interactive UI resource (served to hosts that support MCP Apps).
  registerAppResource(
    server,
    'Clinical Trials Map',
    MAP_RESOURCE_URI,
    { description: 'Interactive world map of clinical trial locations.' },
    async () => ({
      contents: [
        {
          uri: MAP_RESOURCE_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: MAP_HTML,
          _meta: {
            ui: {
              csp: {
                resourceDomains: RESOURCE_DOMAINS,
                connectDomains: ['https://esm.sh'],
              },
            },
          },
        },
      ],
    })
  );

  registerAppTool(
    server,
    'clinicaltrials_search_studies_map',
    {
      title: 'Search Clinical Trials (Map View)',
      description:
        'Search ClinicalTrials.gov and render matching trials as an interactive world map of their locations. Markers are colored by recruitment status; clicking a marker shows trial details and can open the full study. Use this when the user wants to see WHERE trials are located, or asks to visualize/map trials. Re-call with refined filters (condition, status, phase, country) to update the same map. Also returns a text summary as a fallback.',
      inputSchema,
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      _meta: { ui: { resourceUri: MAP_RESOURCE_URI } },
    },
    async (args) => {
      try {
        const { country, ...rest } = args;
        const params: SearchStudiesParams = { ...rest, locationTerm: country };
        const response = await client.searchStudies(params);

        const studies = (response.studies || [])
          .map(toMapStudy)
          .filter((s) => s.locations.length > 0);
        const mappedSites = studies.reduce((sum, s) => sum + s.locations.length, 0);

        const query: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(args)) {
          if (v !== undefined && k !== 'pageSize') query[k] = v;
        }

        const data = {
          query,
          totalCount: response.totalCount ?? 0,
          count: studies.length,
          mappedSites,
          studies,
        };

        const topLines = studies
          .slice(0, 10)
          .map((s) => `- ${s.title} (${s.nctId}) — ${s.status}, ${s.locations.length} site(s)`)
          .join('\n');
        const text =
          `Rendered an interactive map of ${studies.length} trial(s) across ${mappedSites} site(s)` +
          (response.totalCount ? ` (out of ${response.totalCount} total matches)` : '') +
          `.\n\n${topLines}` +
          (studies.length > 10 ? `\n…and ${studies.length - 10} more.` : '');

        return {
          content: [{ type: 'text', text }],
          structuredContent: data,
        };
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
      }
    }
  );
}
