import type { SupabaseClient } from "@supabase/supabase-js";

import type { CheckInTime } from "@/lib/onboarding/draft";
import type { Database } from "@/lib/supabase/database";

type Client = SupabaseClient<Database>;

export type NotificationKind = Database["public"]["Enums"]["notification_kind"];

export type StoredNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  dedupe_key: string;
  read_at: string | null;
  created_at: string;
};

const NOTIFICATION_COLUMNS =
  "id, kind, title, body, href, dedupe_key, created_at, read_at" as const;

export function checkInDedupeKey(date: string, checkIn: CheckInTime) {
  return `check_in:${date}:${checkIn}`;
}

export async function loadNotifications(supabase: Client) {
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    const message = error.message?.toLowerCase() ?? "";
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      message.includes("does not exist") ||
      message.includes("could not find the table")
    ) {
      return [];
    }
    throw error;
  }

  return (data ?? []).map(fromRow);
}

export async function insertCheckInNotification(
  supabase: Client,
  input: { date: string; checkIn: CheckInTime; body: string },
) {
  const userId = await requireUserId(supabase);
  const dedupe_key = checkInDedupeKey(input.date, input.checkIn);
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      kind: "check_in",
      title: "Check-in",
      body: input.body,
      href: "/home",
      dedupe_key,
    })
    .select(NOTIFICATION_COLUMNS)
    .single();

  if (!error && data) {
    return { row: fromRow(data), created: true as const };
  }

  if (isUniqueViolation(error)) {
    const existing = await supabase
      .from("notifications")
      .select(NOTIFICATION_COLUMNS)
      .eq("dedupe_key", dedupe_key)
      .maybeSingle();

    return {
      row: existing.data ? fromRow(existing.data) : null,
      created: false as const,
    };
  }

  throw error;
}

export async function markNotificationRead(supabase: Client, id: string) {
  const readAt = new Date().toISOString();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("id", id)
    .is("read_at", null);

  if (error) {
    throw error;
  }

  return readAt;
}

export async function markAllNotificationsRead(supabase: Client) {
  const readAt = new Date().toISOString();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: readAt })
    .is("read_at", null);

  if (error) {
    throw error;
  }

  return readAt;
}

function fromRow(row: {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  dedupe_key: string;
  created_at: string;
  read_at: string | null;
}): StoredNotification {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    href: row.href,
    dedupe_key: row.dedupe_key,
    created_at: row.created_at,
    read_at: row.read_at,
  };
}

function isUniqueViolation(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  return error.code === "23505" || (error.message?.toLowerCase().includes("duplicate") ?? false);
}

async function requireUserId(supabase: Client) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  return user.id;
}
