# Evaluation

This folder contains an evaluation set for the `clinicaltrials-mcp-server`, created
following Phase 4 of the Anthropic [mcp-builder skill](https://github.com/anthropics/skills/tree/main/skills/mcp-builder).

## What it tests

`evaluation.xml` holds 10 question/answer pairs. Each question is:

- **Independent** — solvable on its own, in any order.
- **Read-only** — only `clinicaltrials_search_studies` and `clinicaltrials_get_study` are needed.
- **Verifiable** — a single answer that can be checked by string comparison.
- **Stable** — anchored to COMPLETED trials (by NCT ID), so the underlying facts do not change over time.

## How to run

Point an MCP client at the server and, for each `<qa_pair>`, ask the model the
`<question>`, letting it call the tools. Compare the model's final answer to the
expected `<answer>` (case-insensitive substring match is sufficient).

Server endpoint (Streamable HTTP):

```
https://clinicaltrials-mcp-server-three.vercel.app/mcp
```

Local (stdio): `node dist/server.js` — or local HTTP: `node dist/http-server.js` then POST to `http://localhost:3000/mcp`.

## Answer key sourcing

Every answer was derived directly from `clinicaltrials_get_study` output for the
referenced NCT ID (lead sponsor, eligibility age/sex, intervention names), so it
matches exactly what the tool returns.
