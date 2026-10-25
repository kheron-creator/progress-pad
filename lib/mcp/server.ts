import "server-only";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { PILLAR_IDS, type PillarId, type WritingKind } from "@/lib/home/store";
import type { McpUser } from "@/lib/mcp/auth";
import { addDays, MCP_TIME_ZONE, resolveDate, todayIso } from "@/lib/mcp/dates";
import { flattenDayTriggers, loadDatePlan } from "@/lib/triggers/store";

const WRITING_KINDS = ["gratitude", "quotes", "journal", "reflections", "done"] as const;

const WRITING_LABELS: Record<WritingKind, string> = {
  gratitude: "Gratitude",
  quotes: "Quotes",
  journal: "Let's Journal",
  reflections: "Reflections",
  done: "Done List",
};

const MAX_RANGE_DAYS = 400;

const dateArg = z
  .string()
  .optional()
  .describe('Calendar date as YYYY-MM-DD, or "today" / "yesterday". Defaults to today.');

const SERVER_INSTRUCTIONS = `Progress Pad is a personal journal and habit dashboard. Dates are calendar days in ${MCP_TIME_ZONE}.
- Six Life Pillars: daily 1-10 ratings for mentally, emotionally, professionally, physically, socially, romantically. A drop of 3+ points is a "disaster pattern" worth gently asking about.
- Writing sections per day: gratitude, quotes, journal ("Let's Journal"), reflections, and done (the Done List of wins).
- Mind Sweep: a brain dump of open loops, each todo or achieved.
- Triggers: small habit cues kept in a library and planned onto days, one at a time or as scenarios (saved routines). Each is todo or achieved for that day.
Write what the user said in their own words. Nothing here deletes data; deleting stays in the app.`;

function json(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function fail(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : "Something went wrong";
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

/** Matches by id, then exact name, then a single partial name match. */
function pickByName<T extends { id: string; name: string }>(items: readonly T[], query: string) {
  const value = query.trim();
  const needle = value.toLowerCase();
  const partial = items.filter((item) => item.name.toLowerCase().includes(needle));
  return (
    items.find((item) => item.id === value) ??
    items.find((item) => item.name.toLowerCase() === needle) ??
    (partial.length === 1 ? partial[0] : undefined)
  );
}

function checkRange(from: string, to: string) {
  if (from > to) {
    throw new Error("`from` must be on or before `to`.");
  }

  const days = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
  if (days > MAX_RANGE_DAYS) {
    throw new Error(`Ranges are limited to ${MAX_RANGE_DAYS} days.`);
  }
}

export function createProgressPadServer(user: McpUser) {
  const { supabase, userId } = user;
  const server = new McpServer(
    { name: "progress-pad", title: "Progress Pad", version: "0.1.0" },
    { instructions: SERVER_INSTRUCTIONS },
  );

  async function dayTriggers(onDate: string) {
    const [plan, states] = await Promise.all([
      loadDatePlan(supabase),
      supabase.from("date_trigger_states").select("trigger_id, status").eq("on_date", onDate),
    ]);

    if (states.error) {
      throw states.error;
    }

    const statuses = Object.fromEntries((states.data ?? []).map((row) => [row.trigger_id, row.status]));
    return flattenDayTriggers(plan.assignments[onDate] ?? [], plan.triggers, plan.scenarios, statuses);
  }

  async function libraryTriggers() {
    const { data, error } = await supabase
      .from("triggers")
      .select("id, name, emoji")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) {
      throw error;
    }
    return data ?? [];
  }

  async function libraryScenarios() {
    const { data, error } = await supabase
      .from("scenarios")
      .select("id, name, emoji, description")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) {
      throw error;
    }
    return data ?? [];
  }

  /** Appends a trigger or scenario to a day's plan, like dropping it onto a date in the app. */
  async function planOnDate(kind: "trigger" | "scenario", id: string, onDate: string) {
    const { data, error } = await supabase
      .from("date_assignments")
      .select("kind, trigger_id, scenario_id, position")
      .eq("on_date", onDate);
    if (error) {
      throw error;
    }

    const rows = data ?? [];
    const exists = rows.some((row) =>
      kind === "trigger" ? row.trigger_id === id : row.scenario_id === id,
    );
    if (exists) {
      return false;
    }

    const position = rows.reduce((max, row) => Math.max(max, row.position + 1), 0);
    const { error: insertError } = await supabase.from("date_assignments").insert({
      user_id: userId,
      on_date: onDate,
      kind,
      trigger_id: kind === "trigger" ? id : null,
      scenario_id: kind === "scenario" ? id : null,
      position,
    });
    if (insertError) {
      throw insertError;
    }
    return true;
  }

  server.registerTool(
    "get_day",
    {
      title: "Get a day",
      description:
        "Everything logged for one day: pillar ratings, triggers and whether each was achieved, mind sweep items, and all writing (gratitude, quotes, journal, reflections, done list). Also lists mind sweep items still open from earlier days.",
      inputSchema: { date: dateArg },
      annotations: { readOnlyHint: true },
    },
    async ({ date }) => {
      try {
        const onDate = resolveDate(date);
        const [pillars, writing, sweep, openSweep, triggers] = await Promise.all([
          supabase.from("pillar_entries").select("pillar_id, rating, notes").eq("on_date", onDate),
          supabase
            .from("writing_entries")
            .select("id, kind, title, notes, created_at")
            .eq("on_date", onDate)
            .order("created_at", { ascending: true }),
          supabase
            .from("mind_sweep_items")
            .select("id, title, notes, status")
            .eq("on_date", onDate)
            .order("sort_order", { ascending: true }),
          supabase
            .from("mind_sweep_items")
            .select("id, on_date, title, notes")
            .eq("status", "todo")
            .lt("on_date", onDate)
            .order("on_date", { ascending: false })
            .limit(50),
          dayTriggers(onDate),
        ]);

        for (const result of [pillars, writing, sweep, openSweep]) {
          if (result.error) {
            throw result.error;
          }
        }

        const writingByKind = Object.fromEntries(
          WRITING_KINDS.map((kind) => [
            WRITING_LABELS[kind],
            (writing.data ?? [])
              .filter((row) => row.kind === kind)
              .map(({ id, title, notes }) => ({ id, text: title, notes })),
          ]),
        );

        return json({
          date: onDate,
          pillars: Object.fromEntries(
            PILLAR_IDS.map((id) => {
              const row = pillars.data?.find((entry) => entry.pillar_id === id);
              return [id, row ? { rating: row.rating, notes: row.notes } : null];
            }),
          ),
          triggers,
          mindSweep: sweep.data,
          openMindSweepFromEarlierDays: openSweep.data,
          writing: writingByKind,
        });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "rate_pillars",
    {
      title: "Rate life pillars",
      description:
        "Save Six Life Pillar ratings (1-10) for a day, with optional notes. Only the pillars you pass are changed.",
      inputSchema: {
        date: dateArg,
        ratings: z
          .array(
            z.object({
              pillar: z.enum(PILLAR_IDS),
              rating: z.number().int().min(1).max(10),
              notes: z.string().max(2000).optional(),
            }),
          )
          .min(1)
          .max(6),
      },
      annotations: { idempotentHint: true },
    },
    async ({ date, ratings }) => {
      try {
        const onDate = resolveDate(date);
        const unique = new Map<PillarId, (typeof ratings)[number]>();
        for (const entry of ratings) {
          unique.set(entry.pillar, entry);
        }

        const rows = [...unique.values()].map((entry) => ({
          user_id: userId,
          on_date: onDate,
          pillar_id: entry.pillar,
          rating: entry.rating,
          ...(entry.notes !== undefined ? { notes: entry.notes.trim() || null } : {}),
        }));

        const { error } = await supabase
          .from("pillar_entries")
          .upsert(rows, { onConflict: "user_id,on_date,pillar_id" });

        if (error) {
          throw error;
        }

        return json({ saved: rows.length, date: onDate });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "pillar_trends",
    {
      title: "Pillar trends",
      description:
        "Six Life Pillar ratings across a date range: daily scores, the average per pillar, and day-to-day drops of 3 or more points (disaster patterns).",
      inputSchema: {
        from: z.string().describe("Start date, YYYY-MM-DD"),
        to: dateArg,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ from, to }) => {
      try {
        const start = resolveDate(from);
        const end = resolveDate(to);
        checkRange(start, end);

        const { data, error } = await supabase
          .from("pillar_entries")
          .select("on_date, pillar_id, rating, notes")
          .gte("on_date", start)
          .lte("on_date", end)
          .order("on_date", { ascending: true });

        if (error) {
          throw error;
        }

        const rows = (data ?? []).map((row) => ({ ...row, on_date: String(row.on_date).slice(0, 10) }));
        const averages: Record<string, number | null> = {};
        const drops: { pillar: string; from: string; to: string; before: number; after: number }[] = [];

        for (const pillar of PILLAR_IDS) {
          const series = rows.filter((row) => row.pillar_id === pillar);
          averages[pillar] = series.length
            ? Math.round((series.reduce((sum, row) => sum + row.rating, 0) / series.length) * 10) / 10
            : null;

          for (let index = 1; index < series.length; index += 1) {
            const before = series[index - 1];
            const after = series[index];
            if (before.rating - after.rating >= 3) {
              drops.push({
                pillar,
                from: before.on_date,
                to: after.on_date,
                before: before.rating,
                after: after.rating,
              });
            }
          }
        }

        const days: Record<string, Record<string, number>> = {};
        for (const row of rows) {
          days[row.on_date] = { ...days[row.on_date], [row.pillar_id]: row.rating };
        }

        return json({ from: start, to: end, averages, drops, days });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "add_entry",
    {
      title: "Add a journal entry",
      description:
        'Add to a writing section for a day. kind: "gratitude", "quotes", "journal" (Let\'s Journal), "reflections", or "done" (Done List win). `text` is the entry itself; `notes` is optional extra detail.',
      inputSchema: {
        kind: z.enum(WRITING_KINDS),
        text: z.string().min(1).max(500),
        notes: z.string().max(10000).optional(),
        date: dateArg,
      },
    },
    async ({ kind, text, notes, date }) => {
      try {
        const title = text.trim();
        if (!title) {
          throw new Error("Text is required");
        }

        const { data, error } = await supabase
          .from("writing_entries")
          .insert({
            user_id: userId,
            on_date: resolveDate(date),
            kind,
            title,
            notes: notes?.trim() || null,
          })
          .select("id, on_date, kind, title, notes")
          .single();

        if (error) {
          throw error;
        }

        return json({ added: { ...data, section: WRITING_LABELS[kind] } });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "update_entry",
    {
      title: "Edit a journal entry",
      description: "Change the text or notes of an existing writing entry, by its id.",
      inputSchema: {
        id: z.string().uuid(),
        text: z.string().min(1).max(500).optional(),
        notes: z.string().max(10000).nullable().optional(),
      },
      annotations: { idempotentHint: true },
    },
    async ({ id, text, notes }) => {
      try {
        const patch: { title?: string; notes?: string | null } = {};
        if (text !== undefined) {
          patch.title = text.trim();
          if (!patch.title) {
            throw new Error("Text cannot be empty");
          }
        }
        if (notes !== undefined) {
          patch.notes = notes?.trim() || null;
        }
        if (Object.keys(patch).length === 0) {
          throw new Error("Nothing to change");
        }

        const { data, error } = await supabase
          .from("writing_entries")
          .update(patch)
          .eq("id", id)
          .select("id, on_date, kind, title, notes")
          .maybeSingle();

        if (error) {
          throw error;
        }
        if (!data) {
          throw new Error("No entry with that id");
        }

        return json({ updated: data });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "list_entries",
    {
      title: "Find journal entries",
      description:
        "List or search past writing entries (gratitude, quotes, journal, reflections, done list), newest first. Filter by kind, date range and words.",
      inputSchema: {
        kind: z.enum(WRITING_KINDS).optional(),
        from: z.string().optional().describe("Start date, YYYY-MM-DD. Defaults to 30 days ago."),
        to: dateArg,
        search: z.string().max(200).optional().describe("Words to look for in the text or notes"),
        limit: z.number().int().min(1).max(200).optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ kind, from, to, search, limit }) => {
      try {
        const end = resolveDate(to);
        const start = from ? resolveDate(from) : addDays(end, -30);
        checkRange(start, end);

        let query = supabase
          .from("writing_entries")
          .select("id, on_date, kind, title, notes")
          .gte("on_date", start)
          .lte("on_date", end)
          .order("on_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(limit ?? 50);

        if (kind) {
          query = query.eq("kind", kind);
        }

        const term = search?.replace(/[%_,()"\\]/g, " ").replace(/\s+/g, " ").trim();
        if (term) {
          query = query.or(`title.ilike."%${term}%",notes.ilike."%${term}%"`);
        }

        const { data, error } = await query;
        if (error) {
          throw error;
        }

        return json({
          from: start,
          to: end,
          entries: (data ?? []).map((row) => ({
            id: row.id,
            date: String(row.on_date).slice(0, 10),
            section: WRITING_LABELS[row.kind],
            text: row.title,
            notes: row.notes,
          })),
        });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "mind_sweep",
    {
      title: "Mind sweep",
      description:
        "Brain-dump one or more open loops into the Mind Sweep for a day. Each item is a short title with optional notes. New items go to the top, like in the app.",
      inputSchema: {
        items: z
          .array(z.object({ title: z.string().min(1).max(300), notes: z.string().max(5000).optional() }))
          .min(1)
          .max(50),
        date: dateArg,
      },
    },
    async ({ items, date }) => {
      try {
        const onDate = resolveDate(date);
        const { data: first, error: readError } = await supabase
          .from("mind_sweep_items")
          .select("sort_order")
          .eq("on_date", onDate)
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (readError) {
          throw readError;
        }

        const top = first == null ? 1 : first.sort_order - 1;
        const cleaned = items
          .map((item) => ({ title: item.title.trim(), notes: item.notes?.trim() || null }))
          .filter((item) => item.title);

        // First item in the list ends up on top.
        const rows = cleaned.map((item, index) => ({
          user_id: userId,
          on_date: onDate,
          title: item.title,
          notes: item.notes,
          status: "todo" as const,
          sort_order: top - (cleaned.length - 1 - index),
        }));

        const { data, error } = await supabase
          .from("mind_sweep_items")
          .insert(rows)
          .select("id, on_date, title, notes, status");

        if (error) {
          throw error;
        }

        return json({ added: data });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "list_mind_sweep",
    {
      title: "List mind sweep",
      description:
        "List Mind Sweep items. By default shows everything still open (todo) across all days; filter by status or date range.",
      inputSchema: {
        status: z.enum(["todo", "achieved", "all"]).optional(),
        from: z.string().optional().describe("Start date, YYYY-MM-DD"),
        to: z.string().optional().describe("End date, YYYY-MM-DD"),
        limit: z.number().int().min(1).max(200).optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ status, from, to, limit }) => {
      try {
        let query = supabase
          .from("mind_sweep_items")
          .select("id, on_date, title, notes, status")
          .order("on_date", { ascending: false })
          .order("sort_order", { ascending: true })
          .limit(limit ?? 100);

        const wanted = status ?? "todo";
        if (wanted !== "all") {
          query = query.eq("status", wanted);
        }
        if (from) {
          query = query.gte("on_date", resolveDate(from));
        }
        if (to) {
          query = query.lte("on_date", resolveDate(to));
        }

        const { data, error } = await query;
        if (error) {
          throw error;
        }

        return json({ items: data });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "update_mind_sweep_item",
    {
      title: "Update a mind sweep item",
      description:
        "Mark a Mind Sweep item achieved or back to todo, rename it, change its notes, or move it to another day.",
      inputSchema: {
        id: z.string().uuid(),
        status: z.enum(["todo", "achieved"]).optional(),
        title: z.string().min(1).max(300).optional(),
        notes: z.string().max(5000).nullable().optional(),
        date: z.string().optional().describe("Move the item to this date (YYYY-MM-DD)"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ id, status, title, notes, date }) => {
      try {
        const patch: { status?: "todo" | "achieved"; title?: string; notes?: string | null; on_date?: string } =
          {};
        if (status) {
          patch.status = status;
        }
        if (title !== undefined) {
          patch.title = title.trim();
          if (!patch.title) {
            throw new Error("Title cannot be empty");
          }
        }
        if (notes !== undefined) {
          patch.notes = notes?.trim() || null;
        }
        if (date) {
          patch.on_date = resolveDate(date);
        }
        if (Object.keys(patch).length === 0) {
          throw new Error("Nothing to change");
        }

        const { data, error } = await supabase
          .from("mind_sweep_items")
          .update(patch)
          .eq("id", id)
          .select("id, on_date, title, notes, status")
          .maybeSingle();

        if (error) {
          throw error;
        }
        if (!data) {
          throw new Error("No mind sweep item with that id");
        }

        return json({ updated: data });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "list_triggers",
    {
      title: "List triggers",
      description:
        "The triggers planned for a day (from single triggers and scenarios) and whether each is achieved. Set include_library to also see every trigger and scenario in the library.",
      inputSchema: { date: dateArg, include_library: z.boolean().optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ date, include_library }) => {
      try {
        const onDate = resolveDate(date);
        const planned = await dayTriggers(onDate);
        if (!include_library) {
          return json({ date: onDate, planned });
        }

        const [library, scenarios] = await Promise.all([libraryTriggers(), libraryScenarios()]);
        return json({ date: onDate, planned, library, scenarios });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "set_trigger_status",
    {
      title: "Tick a trigger",
      description:
        "Mark a trigger planned for a day as achieved, or back to todo. Pass the trigger's id, or its name as it appears in list_triggers.",
      inputSchema: {
        trigger: z.string().min(1).describe("Trigger id or name"),
        status: z.enum(["achieved", "todo"]),
        date: dateArg,
      },
      annotations: { idempotentHint: true },
    },
    async ({ trigger, status, date }) => {
      try {
        const onDate = resolveDate(date);
        const planned = await dayTriggers(onDate);
        const match = pickByName(planned, trigger);

        if (!match) {
          return fail(
            new Error(
              `No single trigger matching "${trigger}" is planned for ${onDate}. Planned: ${
                planned.map((item) => item.name).join(", ") || "none"
              }.`,
            ),
          );
        }

        const { error } = await supabase
          .from("date_trigger_states")
          .upsert(
            { user_id: userId, on_date: onDate, trigger_id: match.id, status },
            { onConflict: "user_id,on_date,trigger_id" },
          );

        if (error) {
          throw error;
        }

        return json({ date: onDate, trigger: match.name, status });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "add_trigger",
    {
      title: "Add a trigger",
      description:
        "Add a trigger to a day's plan. Uses the trigger from the library if one with that name exists, otherwise creates it. Set plan to false to only add it to the library.",
      inputSchema: {
        name: z.string().min(1).max(120),
        emoji: z.string().max(16).optional().describe("One emoji for the trigger. Pick a fitting one if the user gives none."),
        date: dateArg,
        plan: z.boolean().optional().describe("Plan it onto the day (default true)"),
      },
    },
    async ({ name, emoji, date, plan }) => {
      try {
        const onDate = resolveDate(date);
        const title = name.trim();
        if (!title) {
          throw new Error("Name is required");
        }

        const library = await libraryTriggers();
        let trigger = library.find((item) => item.name.trim().toLowerCase() === title.toLowerCase());
        const created = !trigger;

        if (!trigger) {
          const { data, error } = await supabase
            .from("triggers")
            .insert({ user_id: userId, name: title, emoji: emoji?.trim() || "✨" })
            .select("id, name, emoji")
            .single();
          if (error) {
            throw error;
          }
          trigger = data;
        }

        if (plan === false) {
          return json({ trigger, createdInLibrary: created, planned: false });
        }

        const alreadyPlanned = (await dayTriggers(onDate)).some((item) => item.id === trigger.id);
        const added = alreadyPlanned ? false : await planOnDate("trigger", trigger.id, onDate);

        return json({
          trigger,
          createdInLibrary: created,
          date: onDate,
          planned: true,
          alreadyPlanned: !added,
        });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "plan_scenario",
    {
      title: "Plan a scenario",
      description:
        "Add a scenario (a saved routine of triggers) from the library to a day's plan. Pass its id or name; list_triggers with include_library shows them.",
      inputSchema: {
        scenario: z.string().min(1).describe("Scenario id or name"),
        date: dateArg,
      },
    },
    async ({ scenario, date }) => {
      try {
        const onDate = resolveDate(date);
        const scenarios = await libraryScenarios();
        const match = pickByName(scenarios, scenario);

        if (!match) {
          return fail(
            new Error(
              `No single scenario matching "${scenario}". Scenarios: ${
                scenarios.map((item) => item.name).join(", ") || "none"
              }.`,
            ),
          );
        }

        const added = await planOnDate("scenario", match.id, onDate);
        const planned = await dayTriggers(onDate);
        return json({ scenario: match.name, date: onDate, alreadyPlanned: !added, planned });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerResource(
    "today",
    "progresspad://today",
    {
      title: "Today in Progress Pad",
      description: `Today's date in ${MCP_TIME_ZONE} and how the Progress Pad is organised.`,
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: `Today is ${todayIso()} (${MCP_TIME_ZONE}).\n\n${SERVER_INSTRUCTIONS}` }],
    }),
  );

  server.registerPrompt(
    "morning_reset",
    {
      title: "Morning T reset",
      description: "Start the day: gratitude, a mind sweep, and pillar ratings.",
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Walk me through my Progress Pad morning reset, one question at a time. First check today's pad with get_day. Then ask for one thing I'm grateful for (add_entry gratitude), then everything on my mind (mind_sweep), then help me pick my top three from the open mind sweep items. Finish by asking me to rate my six pillars (rate_pillars). Keep it warm and brief.",
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "evening_upcycle",
    {
      title: "Evening upcycle",
      description: "Close the day: wins, gratitude, a quote, and a reflection.",
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Walk me through my Progress Pad evening, one question at a time. Check today with get_day first. Ask what I got done today, including unplanned wins (add_entry done), one thing I'm grateful for tonight (add_entry gratitude), any quote that stood out (add_entry quotes), and a short reflection on what today taught me (add_entry reflections). Offer to tick any triggers I completed. Keep it warm and brief.",
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "pillar_check",
    {
      title: "Disaster pattern check",
      description: "Look at the last two weeks of pillar ratings and talk through any drops.",
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Use pillar_trends from ${addDays(todayIso(), -14)} to today. Tell me which pillars are strongest and weakest, point out any drops of 3+ points, and ask me gently what changed and what a 10 would look like in the weakest pillar.`,
          },
        },
      ],
    }),
  );

  return server;
}
