"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HOME_BANNERS } from "@/lib/home/content";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database";

export const HOME_BANNER_SECTIONS = [
  HOME_BANNERS.triggers.kicker,
  HOME_BANNERS.writing.kicker,
  HOME_BANNERS.pillars.kicker,
] as const;

export const HOME_CONTENT_SECTIONS = [
  "triggers",
  "mind-sweep",
  "done-list",
  "gratitude",
  "quotes",
  "journal",
  "reflections",
  "pillars",
] as const;

/** Default page order: banners sit above the sections they introduce. */
export const REORDERABLE_HOME_SECTIONS = [
  HOME_BANNERS.triggers.kicker,
  "triggers",
  "mind-sweep",
  HOME_BANNERS.writing.kicker,
  "done-list",
  "gratitude",
  HOME_BANNERS.pillars.kicker,
  "quotes",
  "journal",
  "reflections",
  "pillars",
] as const;

export type HomeBannerSectionId = (typeof HOME_BANNER_SECTIONS)[number];
export type HomeContentSectionId = (typeof HOME_CONTENT_SECTIONS)[number];
export type HomeSectionId = (typeof REORDERABLE_HOME_SECTIONS)[number];

const BANNER_INSERT_BEFORE: Record<HomeBannerSectionId, HomeContentSectionId> = {
  [HOME_BANNERS.triggers.kicker]: "triggers",
  [HOME_BANNERS.writing.kicker]: "done-list",
  [HOME_BANNERS.pillars.kicker]: "quotes",
};

/** Older local/remote ids → current banner kickers. */
const LEGACY_SECTION_IDS: Record<string, HomeSectionId> = {
  "banner-triggers": HOME_BANNERS.triggers.kicker,
  "banner-writing": HOME_BANNERS.writing.kicker,
  "banner-pillars": HOME_BANNERS.pillars.kicker,
};

const STORAGE_KEY = "progresspad:home-section-order";
const ORDER_EVENT = "pp-home-section-order";

export function isHomeBannerSection(id: string): id is HomeBannerSectionId {
  return (HOME_BANNER_SECTIONS as readonly string[]).includes(id);
}

export function isHomeContentSection(id: string): id is HomeContentSectionId {
  return (HOME_CONTENT_SECTIONS as readonly string[]).includes(id);
}

function insertMissing(
  next: HomeSectionId[],
  seen: Set<string>,
  id: HomeSectionId,
) {
  if (seen.has(id)) {
    return;
  }

  if (isHomeBannerSection(id)) {
    const anchor = BANNER_INSERT_BEFORE[id];
    const anchorIndex = next.indexOf(anchor);
    if (anchorIndex >= 0) {
      next.splice(anchorIndex, 0, id);
    } else {
      next.push(id);
    }
  } else {
    next.push(id);
  }
  seen.add(id);
}

export function normalizeHomeSectionOrder(order: readonly string[]): HomeSectionId[] {
  const allowed = new Set<string>(REORDERABLE_HOME_SECTIONS);
  const seen = new Set<string>();
  const next: HomeSectionId[] = [];

  for (const raw of order) {
    const id = LEGACY_SECTION_IDS[raw] ?? raw;
    if (!allowed.has(id) || seen.has(id)) {
      continue;
    }
    next.push(id as HomeSectionId);
    seen.add(id);
  }

  for (const id of REORDERABLE_HOME_SECTIONS) {
    insertMissing(next, seen, id);
  }

  return next;
}

function parseOrder(value: unknown): HomeSectionId[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  if (!value.every((item) => typeof item === "string")) {
    return null;
  }
  return normalizeHomeSectionOrder(value);
}

function readLocalHomeSectionOrder(): HomeSectionId[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return parseOrder(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeLocalHomeSectionOrder(order: HomeSectionId[], notify = true) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  if (!notify) {
    return;
  }
  // Defer so listeners (e.g. AppFlowNavigator) don't setState during another component's render.
  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent(ORDER_EVENT, { detail: order }));
  });
}

export function loadHomeSectionOrder(): HomeSectionId[] {
  return readLocalHomeSectionOrder() ?? [...REORDERABLE_HOME_SECTIONS];
}

async function fetchRemoteHomeSectionOrder(): Promise<{
  order: HomeSectionId[];
  needsRewrite: boolean;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_data")
    .select("home_section_order")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const raw = data?.home_section_order;
  const order = parseOrder(raw);
  if (!order) {
    return null;
  }

  const needsRewrite =
    Array.isArray(raw) &&
    raw.some((id) => typeof id === "string" && id in LEGACY_SECTION_IDS);

  return { order, needsRewrite };
}

async function persistRemoteHomeSectionOrder(order: HomeSectionId[]) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.from("user_data").upsert({
    user_id: user.id,
    home_section_order: order as unknown as Json,
  });

  if (error) {
    throw error;
  }
}

export function saveHomeSectionOrder(order: readonly string[]) {
  const next = normalizeHomeSectionOrder(order);
  writeLocalHomeSectionOrder(next);
  void persistRemoteHomeSectionOrder(next).catch(() => {
    // Keep local cache; next successful save or hydrate will retry.
  });
  return next;
}

export function useHomeSectionOrder() {
  const [order, setOrderState] = useState<HomeSectionId[]>(() => [...REORDERABLE_HOME_SECTIONS]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    setOrderState(loadHomeSectionOrder());

    function onCustom(event: Event) {
      const detail = (event as CustomEvent<unknown>).detail;
      if (Array.isArray(detail)) {
        setOrderState(normalizeHomeSectionOrder(detail));
      }
    }

    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setOrderState(loadHomeSectionOrder());
      }
    }

    window.addEventListener(ORDER_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ORDER_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromRemote() {
      try {
        const remote = await fetchRemoteHomeSectionOrder();
        if (cancelled) {
          return;
        }

        if (remote) {
          writeLocalHomeSectionOrder(remote.order, !hydratedRef.current);
          setOrderState(remote.order);
          if (remote.needsRewrite) {
            await persistRemoteHomeSectionOrder(remote.order);
          }
          hydratedRef.current = true;
          return;
        }

        const local = readLocalHomeSectionOrder();
        if (local) {
          // Migrate any existing local-only order up to the account once.
          await persistRemoteHomeSectionOrder(local);
          if (!cancelled) {
            hydratedRef.current = true;
          }
          return;
        }

        hydratedRef.current = true;
      } catch {
        // Stay on local/default if remote is unavailable (e.g. migration not applied yet).
      }
    }

    void hydrateFromRemote();
    return () => {
      cancelled = true;
    };
  }, []);

  const setOrder = useCallback((next: HomeSectionId[] | ((current: HomeSectionId[]) => HomeSectionId[])) => {
    setOrderState((current) => {
      const resolved = normalizeHomeSectionOrder(
        typeof next === "function" ? next(current) : next,
      );
      // Persist + notify after commit so sibling listeners don't setState during render.
      queueMicrotask(() => {
        saveHomeSectionOrder(resolved);
      });
      return resolved;
    });
  }, []);

  return [order, setOrder] as const;
}
