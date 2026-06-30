# Tool Grouping and Intent-Based Routing

This document describes how the MCP server tools are organized by intent and use case, following best practices for reliable agent tool use.

## Tool Groups

### Discovery Tools
**Purpose**: Enable users to explore and find clinical trials based on criteria.

**Tools**:
- `search_clinical_trials_by_criteria` - Search trials with filters (condition, status, phase, etc.)
- `get_available_search_filters` - Discover available filter options
- `get_database_statistics` - Get database size and counts

**When to use**: When users want to find trials matching specific criteria, understand search capabilities, or get context about the database scale.

**Example intents**:
- "Find diabetes trials"
- "Show me recruiting phase 2 trials"
- "How many cancer trials are there?"
- "What filters can I use to search?"

### Detail Retrieval Tools
**Purpose**: Retrieve comprehensive information about specific trials.

**Tools**:
- `retrieve_detailed_study_by_nct_id` - Get full study details by NCT ID
- `get_available_data_fields_metadata` - Understand data structure

**When to use**: When users have a specific trial ID and need complete information, or want to understand what data is available.

**Example intents**:
- "Tell me about NCT04000009"
- "What information is available for trial NCT01234567?"
- "Show me the eligibility criteria for this trial"

### System Tools
**Purpose**: Provide system-level information about the API.

**Tools**:
- `get_api_version_info` - Get API version and metadata

**When to use**: For debugging, compatibility checks, or system monitoring.

**Example intents**:
- "What API version is this using?"
- "Check if the API is compatible"

## Intent-Based Routing Guidelines

### Routing Logic

Implement routing logic to select the appropriate tool group based on user intent:

```
User intent analysis:
├─ Contains NCT ID pattern (NCT[0-9]+)
│  └─ Route to Detail Retrieval tools
├─ Asks about specific trial details
│  └─ Route to Detail Retrieval tools
├─ Wants to find/search for trials
│  └─ Route to Discovery tools
├─ Asks about filters or search options
│  └─ Route to Discovery tools
├─ Asks about database size or counts
│  └─ Route to Discovery tools
└─ Asks about API version or system info
   └─ Route to System tools
```

### Tool Selection Within Groups

**Within Discovery group**:
- If user provides specific filters → `search_clinical_trials_by_criteria`
- If user asks about available filters → `get_available_search_filters`
- If user asks about counts/size → `get_database_statistics`

**Within Detail Retrieval group**:
- If user provides NCT ID → `retrieve_detailed_study_by_nct_id`
- If user asks about data structure → `get_available_data_fields_metadata`

## Benefits of Tool Grouping

1. **Improved Accuracy**: Agents reason over a smaller, scoped tool set rather than all 6 tools
2. **Faster Response**: Reduced latency from unnecessary tool evaluations
3. **Better Debugging**: Easier to trace which tool group was selected
4. **Scalability**: Easy to add new tools within existing groups
5. **Clear Intent Mapping**: Direct relationship between user intent and tool group

## Implementation Example

```typescript
// Example routing logic
function routeToToolGroup(userIntent: string): ToolGroup {
  const nctIdMatch = userIntent.match(/NCT\d+/);
  if (nctIdMatch) {
    return 'detail_retrieval';
  }
  
  if (userIntent.includes('find') || userIntent.includes('search') || 
      userIntent.includes('trials matching')) {
    return 'discovery';
  }
  
  if (userIntent.includes('version') || userIntent.includes('api')) {
    return 'system';
  }
  
  // Default to discovery for exploration
  return 'discovery';
}
```

## Testing Strategy

Test tool group routing with various user intents:

- ✅ "Find diabetes trials" → Discovery
- ✅ "Tell me about NCT04000009" → Detail Retrieval
- ✅ "What filters can I use?" → Discovery
- ✅ "How many trials exist?" → Discovery
- ✅ "What API version?" → System
- ✅ "Show me eligibility for NCT01234567" → Detail Retrieval

## Future Enhancements

1. **Add more specific tool groups** as functionality expands
2. **Implement AOPs (Agent Operating Procedures)** for complex workflows
3. **Add evaluation tests** for tool selection accuracy
4. **Create intent classifiers** for automatic routing
