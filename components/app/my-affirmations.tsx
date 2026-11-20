"use client";

// "My affirmations": the signed-in user's MemoPad tracks, played right here.
// MemoPad shares this Supabase project, so its table (memopad_memos) and private bucket (memopad-audio)
// are read with the same login. Row-level security only returns the user's own tracks.
import { useEffect, useState } from "react";

import type { SupabaseClient } from "@supabase/supabase-js";

import { HeadphonesIcon } from "@/components/ui/icon";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/supabase/client";

const MEMOPAD_URL = "https://memo-pad-5pl1.vercel.app";
const SHOW = 5;

type Track = { id: string; title: string; audio_path: string; duration_s: number | null; is_public: boolean | null };

const length = (s: number | null) => {
  if (!s) return "";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, "0")}`;
};

export function MyAffirmations() {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [playing, setPlaying] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      const supabase = createClient();
      // memopad_memos is MemoPad's table, so it is not in this app's generated types
      const { data, error: e } = await (supabase as unknown as SupabaseClient)
        .from("memopad_memos")
        .select("id,title,audio_path,duration_s,is_public")
        .order("created_at", { ascending: false })
        .limit(SHOW);
      if (!live) return;
      if (e) setTracks([]);
      else setTracks((data ?? []) as Track[]);
    })();
    return () => {
      live = false;
    };
  }, []);

  async function play(t: Track) {
    if (playing?.id === t.id) {
      setPlaying(null);
      return;
    }
    setError("");
    const { data, error: e } = await createClient().storage.from("memopad-audio").createSignedUrl(t.audio_path, 3600);
    if (e || !data) {
      setError("That track could not be opened. Try it in MemoPad.");
      return;
    }
    setPlaying({ id: t.id, url: data.signedUrl });
  }

  if (tracks === null) return null;

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HeadphonesIcon size={20} />
          <Text as="h2" variant="cardTitle">
            My affirmations
          </Text>
        </div>
        <a href={`${MEMOPAD_URL}/create.html`} className="type-label rounded-full px-3 py-1.5 hover:bg-background-subtle">
          + Create a track
        </a>
      </div>
      {tracks.length === 0 ? (
        <Text className="mt-3 text-foreground-muted">
          Make your own affirmation track: pick a voice, a pace and a lofi beat, and it saves here.
        </Text>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {tracks.map((t) => (
            <li key={t.id} className="py-2">
              <button
                type="button"
                onClick={() => play(t)}
                className="flex w-full items-center justify-between gap-3 rounded-sm text-left hover:bg-background-subtle"
                aria-label={`${playing?.id === t.id ? "Close" : "Play"} ${t.title}`}
              >
                <span className="truncate">
                  {playing?.id === t.id ? "■" : "▶"} {t.title}
                </span>
                <span className="shrink-0 text-foreground-muted">
                  {t.is_public ? "Public · " : ""}
                  {length(t.duration_s)}
                </span>
              </button>
              {playing?.id === t.id ? <audio src={playing.url} controls autoPlay className="mt-2 w-full" /> : null}
            </li>
          ))}
        </ul>
      )}
      {error ? <Text className="mt-2 text-foreground-muted">{error}</Text> : null}
      <a href={MEMOPAD_URL} className="type-label mt-3 inline-block text-foreground-muted hover:text-foreground">
        Open MemoPad for read-along and sharing
      </a>
    </Card>
  );
}
