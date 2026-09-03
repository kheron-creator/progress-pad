"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionResultEvent = {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function joinSpoken(current: string, spoken: string) {
  const piece = spoken.trim();
  if (!piece) {
    return current;
  }

  const base = current.trimEnd();
  if (!base) {
    return piece;
  }

  return `${base} ${piece}`;
}

function sessionText(results: SpeechRecognitionResultEvent["results"]) {
  let finals = "";
  let interim = "";

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const transcript = result[0]?.transcript ?? "";
    if (result.isFinal) {
      finals = joinSpoken(finals, transcript);
    } else {
      interim += transcript;
    }
  }

  return joinSpoken(finals, interim);
}

export function useSpeechToText({
  value,
  onChange,
}: {
  value: string;
  onChange?: (value: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const valueRef = useRef(value);
  const baseRef = useRef(value);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  valueRef.current = value;

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()));
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  function stop() {
    recognitionRef.current?.stop();
  }

  function start() {
    const Recognition = getSpeechRecognition();
    if (!Recognition || !onChange || listening) {
      return;
    }

    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    baseRef.current = valueRef.current;

    recognition.onresult = (event) => {
      onChange(joinSpoken(baseRef.current, sessionText(event.results)));
    };
    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      recognitionRef.current = null;
    }
  }

  function toggle() {
    if (listening) {
      stop();
      return;
    }

    start();
  }

  return { listening, supported, toggle };
}
