import {
  Study,
  StudySearchResponse,
  StudyFieldsMetadata,
  SearchAreas,
  DatasetStats,
  APIVersion,
} from './types/api.js';

const BASE_URL = 'https://clinicaltrials.gov/api/v2';

export class ClinicalTrialsAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async searchStudies(params?: {
    queryTerm?: string;
    'filter.overallStatus'?: string;
    'filter.phase'?: string;
    'filter.condition'?: string;
    'filter.intervention'?: string;
    'filter.leadSponsor'?: string;
    'filter.studyType'?: string;
    pageSize?: number;
    pageToken?: string;
  }): Promise<StudySearchResponse> {
    if (params?.pageSize !== undefined && (params.pageSize < 1 || params.pageSize > 1000)) {
      throw new Error('pageSize must be between 1 and 1000');
    }
    return this.fetch<StudySearchResponse>('/studies', params);
  }

  async getStudy(nctId: string): Promise<Study> {
    if (!nctId || !/^NCT[0-9]+$/.test(nctId)) {
      throw new Error('Invalid NCT ID format. Must be in format NCT followed by numbers (e.g., NCT04000009)');
    }
    return this.fetch<Study>(`/studies/${nctId}`);
  }

  async getStudyFields(): Promise<StudyFieldsMetadata> {
    return this.fetch<StudyFieldsMetadata>('/studies/metadata');
  }

  async getSearchAreas(): Promise<SearchAreas> {
    return this.fetch<SearchAreas>('/studies/search-areas');
  }

  async getDatasetStats(queryTerm?: string): Promise<DatasetStats> {
    return this.fetch<DatasetStats>('/stats/size', queryTerm ? { queryTerm } : undefined);
  }

  async getAPIVersion(): Promise<APIVersion> {
    return this.fetch<APIVersion>('/version');
  }
}
