import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClinicalTrialsAPIClient, ClinicalTrialsApiError } from '../src/api-client.js';

function mockJson(data: unknown) {
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

describe('ClinicalTrialsAPIClient', () => {
  let client: ClinicalTrialsAPIClient;

  beforeEach(() => {
    client = new ClinicalTrialsAPIClient();
    global.fetch = vi.fn() as any;
  });

  describe('searchStudies', () => {
    it('should validate pageSize is within bounds', async () => {
      mockJson({ studies: [], totalCount: 0 });

      await expect(client.searchStudies({ pageSize: 0 })).rejects.toThrow(
        'pageSize must be between 1 and 1000'
      );
      await expect(client.searchStudies({ pageSize: 1001 })).rejects.toThrow(
        'pageSize must be between 1 and 1000'
      );
    });

    it('should accept valid pageSize values', async () => {
      mockJson({ studies: [], totalCount: 0 });

      await expect(client.searchStudies({ pageSize: 50 })).resolves.toBeDefined();
      await expect(client.searchStudies({ pageSize: 1 })).resolves.toBeDefined();
      await expect(client.searchStudies({ pageSize: 1000 })).resolves.toBeDefined();
    });

    it('should map normalized params to ClinicalTrials.gov v2 query params', async () => {
      mockJson({ studies: [], totalCount: 0 });

      await client.searchStudies({
        query: 'diabetes',
        condition: 'Type 2 Diabetes',
        intervention: 'metformin',
        leadSponsor: 'Pfizer',
        status: 'RECRUITING',
        phase: 'PHASE2',
        studyType: 'INTERVENTIONAL',
        pageSize: 10,
      });

      expect(global.fetch).toHaveBeenCalled();
      // URLSearchParams encodes spaces as '+'; normalize before asserting.
      const url = decodeURIComponent((global.fetch as any).mock.calls[0][0]).replace(/\+/g, ' ');
      expect(url).toContain('query.term=diabetes');
      expect(url).toContain('query.cond=Type 2 Diabetes');
      expect(url).toContain('query.intr=metformin');
      expect(url).toContain('query.spons=Pfizer');
      expect(url).toContain('filter.overallStatus=RECRUITING');
      expect(url).toContain('aggFilters=phase:2,studyType:int');
      expect(url).toContain('pageSize=10');
      expect(url).toContain('countTotal=true');
    });
  });

  describe('getStudy', () => {
    it('should reject invalid NCT ID formats', async () => {
      await expect(client.getStudy('')).rejects.toThrow('Invalid NCT ID format');
      await expect(client.getStudy('INVALID')).rejects.toThrow('Invalid NCT ID format');
      await expect(client.getStudy('NCT')).rejects.toThrow('Invalid NCT ID format');
      await expect(client.getStudy('NCTABC')).rejects.toThrow('Invalid NCT ID format');
    });

    it('should accept a valid NCT ID and hit the right endpoint', async () => {
      mockJson({
        protocolSection: {
          identificationModule: { nctId: 'NCT04000009', briefTitle: 'Test Study' },
        },
      });

      await expect(client.getStudy('NCT04000009')).resolves.toBeDefined();
      const url = (global.fetch as any).mock.calls[0][0];
      expect(url).toContain('/studies/NCT04000009');
    });

    it('should uppercase lowercase NCT IDs', async () => {
      mockJson({ protocolSection: { identificationModule: { nctId: 'NCT04000009' } } });

      await client.getStudy('nct04000009');
      const url = (global.fetch as any).mock.calls[0][0];
      expect(url).toContain('/studies/NCT04000009');
    });
  });

  describe('error handling', () => {
    it('should throw an actionable error on API failure', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.searchStudies()).rejects.toThrow(ClinicalTrialsApiError);
      await expect(client.searchStudies()).rejects.toThrow(
        'ClinicalTrials.gov request failed: 500 Internal Server Error'
      );
    });

    it('should give a specific 400 message', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(client.searchStudies()).rejects.toThrow('ClinicalTrials.gov rejected the request (400)');
    });
  });

  describe('retry behavior', () => {
    it('should retry transient 503 errors and eventually succeed', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ studies: [], totalCount: 0 }) });

      await expect(client.searchStudies()).resolves.toBeDefined();
      expect((global.fetch as any).mock.calls.length).toBe(3);
    });

    it('should give up after 3 attempts on persistent 500', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.searchStudies()).rejects.toThrow('failed after 3 attempts');
      expect((global.fetch as any).mock.calls.length).toBe(3);
    });

    it('should NOT retry deterministic 400 errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(client.searchStudies()).rejects.toThrow('400');
      expect((global.fetch as any).mock.calls.length).toBe(1);
    });

    it('should retry network errors', async () => {
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce({ ok: true, json: async () => ({ studies: [], totalCount: 0 }) });

      await expect(client.searchStudies()).resolves.toBeDefined();
      expect((global.fetch as any).mock.calls.length).toBe(2);
    });
  });
});
