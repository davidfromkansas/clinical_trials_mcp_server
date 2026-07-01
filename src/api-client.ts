import {
  Study,
  StudySearchResponse,
  StudyFieldsMetadata,
  SearchAreas,
  DatasetStats,
  APIVersion,
} from './types/api.js';

const BASE_URL = 'https://clinicaltrials.gov/api/v2';
const REQUEST_TIMEOUT_MS = 30000;
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 300;

/** HTTP status codes worth retrying (transient upstream conditions). */
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Error thrown by the API client, carrying an actionable, agent-facing message. */
export class ClinicalTrialsApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ClinicalTrialsApiError';
  }
}

export type StudyPhase =
  | 'EARLY_PHASE1'
  | 'PHASE1'
  | 'PHASE2'
  | 'PHASE3'
  | 'PHASE4';

export type StudyType = 'INTERVENTIONAL' | 'OBSERVATIONAL' | 'EXPANDED_ACCESS';

export interface SearchStudiesParams {
  query?: string;
  status?: string;
  phase?: StudyPhase;
  condition?: string;
  intervention?: string;
  leadSponsor?: string;
  studyType?: StudyType;
  locationTerm?: string;
  pageSize?: number;
  pageToken?: string;
}

// aggFilters codes used by the ClinicalTrials.gov API v2.
const PHASE_AGG_CODE: Record<StudyPhase, string> = {
  EARLY_PHASE1: '0',
  PHASE1: '1',
  PHASE2: '2',
  PHASE3: '3',
  PHASE4: '4',
};

const STUDY_TYPE_AGG_CODE: Record<StudyType, string> = {
  INTERVENTIONAL: 'int',
  OBSERVATIONAL: 'obs',
  EXPANDED_ACCESS: 'exp',
};

export class ClinicalTrialsAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Retry transient upstream failures (timeouts, network errors, 429/5xx)
    // with exponential backoff. Deterministic client errors (4xx except 429)
    // are surfaced immediately without retrying.
    let lastError: ClinicalTrialsApiError | undefined;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await this.fetchOnce<T>(url.toString(), attempt);
      } catch (error) {
        const apiError =
          error instanceof ClinicalTrialsApiError
            ? error
            : new ClinicalTrialsApiError(
                `Unexpected error contacting ClinicalTrials.gov: ${error instanceof Error ? error.message : String(error)}`
              );
        lastError = apiError;

        const isRetryable =
          apiError.status === undefined || RETRYABLE_STATUS.has(apiError.status);
        if (!isRetryable || attempt === MAX_ATTEMPTS) {
          throw this.withAttemptContext(apiError, attempt);
        }

        // Exponential backoff: 300ms, 600ms, ...
        await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
      }
    }

    // Unreachable, but satisfies the type checker.
    throw lastError ?? new ClinicalTrialsApiError('Request failed for an unknown reason.');
  }

  private async fetchOnce<T>(url: string, attempt: number): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ClinicalTrialsApiError(
          `Request to ClinicalTrials.gov timed out after ${REQUEST_TIMEOUT_MS / 1000}s (attempt ${attempt}/${MAX_ATTEMPTS}).`
        );
      }
      throw new ClinicalTrialsApiError(
        `Network error contacting ClinicalTrials.gov: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new ClinicalTrialsApiError(
        this.describeHttpError(response.status, response.statusText),
        response.status
      );
    }

    return response.json() as Promise<T>;
  }

  /** Append retry context to the message when all attempts are exhausted. */
  private withAttemptContext(error: ClinicalTrialsApiError, attempt: number): ClinicalTrialsApiError {
    const wasRetried =
      attempt > 1 && (error.status === undefined || RETRYABLE_STATUS.has(error.status));
    if (!wasRetried) return error;
    return new ClinicalTrialsApiError(
      `${error.message} (failed after ${attempt} attempts)`,
      error.status
    );
  }

  private describeHttpError(status: number, statusText: string): string {
    switch (status) {
      case 400:
        return 'ClinicalTrials.gov rejected the request (400). Check that filter values use the documented enums (e.g. status=RECRUITING, phase=PHASE2).';
      case 404:
        return 'Not found (404). Verify the NCT ID is correct (format: NCT followed by 8 digits).';
      case 429:
        return 'Rate limit exceeded (429). Wait a moment before making more requests.';
      default:
        return `ClinicalTrials.gov request failed: ${status} ${statusText}`;
    }
  }

  async searchStudies(params: SearchStudiesParams = {}): Promise<StudySearchResponse> {
    if (params.pageSize !== undefined && (params.pageSize < 1 || params.pageSize > 1000)) {
      throw new ClinicalTrialsApiError('pageSize must be between 1 and 1000.');
    }

    const apiParams: Record<string, string | number> = { countTotal: 'true' };

    if (params.query) apiParams['query.term'] = params.query;
    if (params.condition) apiParams['query.cond'] = params.condition;
    if (params.intervention) apiParams['query.intr'] = params.intervention;
    if (params.leadSponsor) apiParams['query.spons'] = params.leadSponsor;
    if (params.locationTerm) apiParams['query.locn'] = params.locationTerm;
    if (params.status) apiParams['filter.overallStatus'] = params.status;

    const aggFilters: string[] = [];
    if (params.phase) aggFilters.push(`phase:${PHASE_AGG_CODE[params.phase]}`);
    if (params.studyType) aggFilters.push(`studyType:${STUDY_TYPE_AGG_CODE[params.studyType]}`);
    if (aggFilters.length > 0) apiParams.aggFilters = aggFilters.join(',');

    if (params.pageSize) apiParams.pageSize = params.pageSize;
    if (params.pageToken) apiParams.pageToken = params.pageToken;

    return this.fetch<StudySearchResponse>('/studies', apiParams);
  }

  async getStudy(nctId: string): Promise<Study> {
    if (!nctId || !/^NCT[0-9]+$/i.test(nctId)) {
      throw new ClinicalTrialsApiError(
        'Invalid NCT ID format. Must be "NCT" followed by numbers (e.g., NCT04000009).'
      );
    }
    return this.fetch<Study>(`/studies/${nctId.toUpperCase()}`);
  }

  async getStudyFields(): Promise<StudyFieldsMetadata> {
    return this.fetch<StudyFieldsMetadata>('/studies/metadata');
  }

  async getSearchAreas(): Promise<SearchAreas> {
    return this.fetch<SearchAreas>('/studies/search-areas');
  }

  async getDatasetStats(query?: string): Promise<DatasetStats> {
    return this.fetch<DatasetStats>('/stats/size', query ? { 'query.term': query } : undefined);
  }

  async getAPIVersion(): Promise<APIVersion> {
    return this.fetch<APIVersion>('/version');
  }
}
