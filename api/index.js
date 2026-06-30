import express from 'express';
import { ClinicalTrialsAPIClient } from '../dist/api-client.js';
import {
  searchStudiesTool,
  handleSearchStudies,
} from '../dist/tools/search-studies.js';
import {
  getStudyTool,
  handleGetStudy,
} from '../dist/tools/get-study.js';
import {
  getStudyFieldsTool,
  handleGetStudyFields,
} from '../dist/tools/get-study-fields.js';
import {
  getSearchAreasTool,
  handleGetSearchAreas,
} from '../dist/tools/get-search-areas.js';
import {
  getDatasetStatsTool,
  handleGetDatasetStats,
} from '../dist/tools/get-dataset-stats.js';
import {
  getAPIVersionTool,
  handleGetAPIVersion,
} from '../dist/tools/get-api-version.js';

const app = express();
app.use(express.json());

const client = new ClinicalTrialsAPIClient();

// List all available tools
app.get('/tools', (req, res) => {
  res.json({
    tools: [
      searchStudiesTool,
      getStudyTool,
      getStudyFieldsTool,
      getSearchAreasTool,
      getDatasetStatsTool,
      getAPIVersionTool,
    ],
  });
});

// Tool execution endpoints
app.post('/tools/search_clinical_trials_by_criteria', async (req, res) => {
  try {
    const result = await handleSearchStudies(client, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/tools/retrieve_detailed_study_by_nct_id', async (req, res) => {
  try {
    const result = await handleGetStudy(client, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get('/tools/get_available_data_fields_metadata', async (req, res) => {
  try {
    const result = await handleGetStudyFields(client);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get('/tools/get_available_search_filters', async (req, res) => {
  try {
    const result = await handleGetSearchAreas(client);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/tools/get_database_statistics', async (req, res) => {
  try {
    const result = await handleGetDatasetStats(client, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get('/tools/get_api_version_info', async (req, res) => {
  try {
    const result = await handleGetAPIVersion(client);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

export default app;
