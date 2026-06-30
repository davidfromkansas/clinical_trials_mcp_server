import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClinicalTrialsAPIClient } from '../api-client.js';

export const searchStudiesTool: Tool = {
  name: 'search_clinical_trials_by_criteria',
  description: 'Discover and search clinical trials from ClinicalTrials.gov database. Use this tool when users want to find trials matching specific criteria like disease condition, location, recruitment status, or treatment phase. Returns paginated results with trial summaries including NCT ID, title, status, and sponsor information.',
  inputSchema: {
    type: 'object',
    properties: {
      queryTerm: {
        type: 'string',
        description: 'Full-text search term to find studies. Use for broad searches when specific filters are not known (e.g., "diabetes", "cancer immunotherapy")',
      },
      status: {
        type: 'string',
        description: 'Filter by trial recruitment status. Use RECRUITING to find trials currently accepting participants',
        enum: [
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
        ],
      },
      phase: {
        type: 'string',
        description: 'Filter by clinical trial phase. PHASE1 tests safety, PHASE2 tests efficacy, PHASE3 compares to standard treatment',
        enum: ['EARLY_PHASE1', 'PHASE1', 'PHASE2', 'PHASE3', 'PHASE4', 'NA'],
      },
      condition: {
        type: 'string',
        description: 'Filter by medical condition or disease being studied (e.g., "Type 2 Diabetes", "Breast Cancer")',
      },
      intervention: {
        type: 'string',
        description: 'Filter by intervention or treatment type (e.g., "Drug", "Device", "Procedure", "Behavioral")',
      },
      leadSponsor: {
        type: 'string',
        description: 'Filter by lead sponsor organization name (e.g., "National Cancer Institute", "Pfizer")',
      },
      studyType: {
        type: 'string',
        description: 'Filter by study design type. INTERVENTIONAL studies test treatments, OBSERVATIONAL studies track outcomes',
        enum: ['INTERVENTIONAL', 'OBSERVATIONAL', 'EXPANDED_ACCESS'],
      },
      pageSize: {
        type: 'number',
        description: 'Number of results to return per page. Use smaller values (10-50) for faster responses, larger values (100-1000) for comprehensive searches',
        default: 50,
        minimum: 1,
        maximum: 1000,
      },
      pageToken: {
        type: 'string',
        description: 'Pagination token from previous search response to retrieve the next page of results',
      },
    },
  },
};

export async function handleSearchStudies(
  client: ClinicalTrialsAPIClient,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const params: any = {};
  
  if (args.queryTerm) params.queryTerm = args.queryTerm;
  if (args.status) params['filter.overallStatus'] = args.status;
  if (args.phase) params['filter.phase'] = args.phase;
  if (args.condition) params['filter.condition'] = args.condition;
  if (args.intervention) params['filter.intervention'] = args.intervention;
  if (args.leadSponsor) params['filter.leadSponsor'] = args.leadSponsor;
  if (args.studyType) params['filter.studyType'] = args.studyType;
  if (args.pageSize) params.pageSize = args.pageSize;
  if (args.pageToken) params.pageToken = args.pageToken;

  const response = await client.searchStudies(params);
  
  const studies = response.studies.map((study: any) => ({
    nctId: study.protocolSection.identificationModule.nctId,
    title: study.protocolSection.identificationModule.briefTitle,
    status: study.protocolSection.statusModule.overallStatus,
    conditions: study.protocolSection.conditionsModule?.conditions?.map((c: any) => c.name) || [],
    sponsor: study.protocolSection.sponsorCollaboratorsModule?.leadSponsor?.name || 'Unknown',
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          studies,
          totalCount: response.totalCount,
          nextPageToken: response.nextPageToken,
        }, null, 2),
      },
    ],
  };
}
