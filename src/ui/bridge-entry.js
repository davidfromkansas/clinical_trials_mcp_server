// Entry point bundled by scripts/inline-ui.mjs (esbuild) and inlined into the
// map widget HTML. Exposing the App class on window lets the widget's inline
// init script talk to the MCP host without any external module loads.
import { App } from '@modelcontextprotocol/ext-apps';

window.__ExtApps = { App };
