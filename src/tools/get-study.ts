import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClinicalTrialsAPIClient } from '../api-client.js';

export const getStudyTool: Tool = {
  name: 'retrieve_detailed_study_by_nct_id',
  description: 'Retrieve comprehensive details about a specific clinical trial using its NCT (ClinicalTrials.gov) identifier. Use this tool when users have a specific trial ID and want complete information including eligibility criteria, locations, sponsors, interventions, and study design. Returns full study record with all available details.',
  inputSchema: {
    type: 'object',
    properties: {
      nctId: {
        type: 'string',
        description: 'ClinicalTrials.gov identifier in format NCT followed by numbers (e.g., NCT04000009). This is the unique identifier for each clinical trial',
        pattern: '^NCT[0-9]+$',
      },
    },
    required: ['nctId'],
  },
};

export async function handleGetStudy(
  client: ClinicalTrialsAPIClient,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const study = await client.getStudy(args.nctId);
  
  const summary = {
    nctId: study.protocolSection.identificationModule.nctId,
    title: study.protocolSection.identificationModule.briefTitle,
    officialTitle: study.protocolSection.identificationModule.officialTitle,
    status: study.protocolSection.statusModule.overallStatus,
    startDate: study.protocolSection.statusModule.startDateStruct?.date,
    completionDate: study.protocolSection.statusModule.completionDateStruct?.date,
    conditions: study.protocolSection.conditionsModule?.conditions?.map((c: any) => c.name) || [],
    sponsor: study.protocolSection.sponsorCollaboratorsModule?.leadSponsor?.name,
    eligibilityCriteria: study.protocolSection.eligibilityModule?.eligibilityCriteria,
    healthyVolunteers: study.protocolSection.eligibilityModule?.healthyVolunteers,
    gender: study.protocolSection.eligibilityModule?.gender,
    minimumAge: study.protocolSection.eligibilityModule?.minimumAge,
    maximumAge: study.protocolSection.eligibilityModule?.maximumAge,
    interventions: study.protocolSection.armsInterventionsModule?.interventions?.map((i: any) => ({
      type: i.interventionType,
      name: i.name,
    })) || [],
    locations: (study.protocolSection.contactsLocationsModule?.locations || []).map((l: any) => ({
      facility: l.facility?.name || 'Unknown',
      city: l.facility?.address?.city || 'Unknown',
      state: l.facility?.address?.state || 'Unknown',
      country: l.facility?.address?.country || 'Unknown',
      status: l.status || 'Unknown',
    })),
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
}
