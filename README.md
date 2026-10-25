# Progress Pad

Web application foundation. Product screens and design tokens will be added in later steps.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run typecheck
npm run build
```

## MCP server (connect Claude)

`/mcp` is a [Model Context Protocol](https://modelcontextprotocol.io) endpoint, so Claude and other MCP clients can read and write a signed-in user's Progress Pad: pillar ratings, writing entries (gratitude, quotes, journal, reflections, done list), mind sweep items and trigger ticks. It never deletes data.

Sign-in uses Supabase Auth's OAuth 2.1 server, with row level security still applied to every query.

One-time setup in the Supabase dashboard, under **Authentication → OAuth Server**:

1. Turn on the OAuth server.
2. Set the authorization path to `/oauth/consent`. Your Site URL (Authentication → URL Configuration) must be the live site, e.g. `https://progress-pad-lemon.vercel.app`.
3. Turn on dynamic client registration, so Claude can register itself.

Then in Claude, open Settings → Connectors → Add custom connector and use `https://<your-site>/mcp`. Claude sends you to `/oauth/consent` to approve access.

Tools: `get_day`, `rate_pillars`, `pillar_trends`, `add_entry`, `update_entry`, `list_entries`, `mind_sweep`, `list_mind_sweep`, `update_mind_sweep_item`, `list_triggers`, `set_trigger_status`. Prompts: `morning_reset`, `evening_upcycle`, `pillar_check`.
