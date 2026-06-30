import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClinicalTrialsAPIClient } from '../src/api-client.js';

describe('ClinicalTrialsAPIClient', () => {
  let client: ClinicalTrialsAPIClient;

  beforeEach(() => {
    client = new ClinicalTrialsAPIClient();
    global.fetch = vi.fn() as any;
  });

  describe('searchStudies', () => {
    it('should validate pageSize is within bounds', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ studies: [], totalCount: 0 }),
      });

      await expect(client.searchStudies({ pageSize: 0 })).rejects.toThrow('pageSize must be between 1 and 1000');
      await expect(client.searchStudies({ pageSize: 1001 })).rejects.toThrow('pageSize must be between 1 and 1000');
    });

    it('should accept valid pageSize values', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ studies: [], totalCount: 0 }),
      });

      await expect(client.searchStudies({ pageSize: 50 })).resolves.toBeDefined();
      await expect(client.searchStudies({ pageSize: 1 })).resolves.toBeDefined();
      await expect(client.searchStudies({ pageSize: 1000 })).resolves.toBeDefined();
    });

    it('should construct correct query parameters', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ studies: [], totalCount: 0 }),
      });

      await client.searchStudies({
        queryTerm: 'diabetes',
        'filter.overallStatus': 'RECRUITING',
        'filter.phase': 'PHASE2',
        pageSize: 10,
      });

      expect(global.fetch).toHaveBeenCalled();
      const url = (global.fetch as any).mock.calls[0][0];
      expect(url).toContain('queryTerm=diabetes');
      expect(url).toContain('filter.overallStatus=RECRUITING');
      expect(url).toContain('filter.phase=PHASE2');
      expect(url).toContain('pageSize=10');
    });
  });

  describe('getStudy', () => {
    it('should validate NCT ID format', async () => {
      await expect(client.getStudy('')).rejects.toThrow('Invalid NCT ID format');
      await expect(client.getStudy('INVALID')).rejects.toThrow('Invalid NCT ID format');
      await expect(client.getStudy('NCT')).rejects.toThrow('Invalid NCT ID format');
      await expect(client.getStudy('NCTABC')).rejects.toThrow('Invalid NCT ID format');
    });

    it('should accept valid NCT ID format', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          protocolSection: {
            identificationModule: { nctId: 'NCT04000009', briefTitle: 'Test Study' },
          },
        }),
      });

      await expect(client.getStudy('NCT04000009')).resolves.toBeDefined();
    });

    it('should construct correct endpoint URL', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          protocolSection: {
            identificationModule: { nctId: 'NCT04000009', briefTitle: 'Test Study' },
          },
        }),
      });

      await client.getStudy('NCT04000009');

      expect(global.fetch).toHaveBeenCalled();
      const url = (global.fetch as any).mock.calls[0][0];
      expect(url).toContain('/studies/NCT04000009');
    });
  });

  describe('error handling', () => {
    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.searchStudies()).rejects.toThrow('API request failed: 500 Internal Server Error');
    });
  });
});
