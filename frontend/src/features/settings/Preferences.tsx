import React, { useEffect, useMemo, useState } from "react";
import { audioCue, prefersReducedAudio } from "@/features/peripheral/AudioCue";
import { preferencesStrings as strings } from "./strings";

const STORAGE_KEY = "wb.audioCues";

type ToggleState = "on" | "off";

function readStoredState(): ToggleState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "on" || value === "off" ? (value as ToggleState) : null;
  } catch {
    return null;
  }
}

function writeStoredState(value: ToggleState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export default function Preferences() {
  const [state, setState] = useState<ToggleState>(() => readStoredState() ?? "off");
  const reduced = useMemo(() => prefersReducedAudio(), []);

  useEffect(() => {
    const enabled = state === "on" && !reduced;
    audioCue.setEnabled(enabled);
    writeStoredState(state);
  }, [state, reduced]);

  useEffect(() => {
    if (reduced) {
      setState("off");
    }
  }, [reduced]);

  const descriptionId = "audio-cue-description";
  const reducedId = "audio-cue-reduced";

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-100">
      <header className="mb-3">
        <h2 className="text-base font-semibold">{strings.title}</h2>
      </header>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="font-medium" id={descriptionId}>{strings.audioCueDescription}</div>
          {reduced && (
            <p id={reducedId} className="text-xs text-slate-400">
              <strong className="block font-semibold text-slate-300">{strings.reducedLabel}</strong>
              {strings.reducedDescription}
            </p>
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-400">{strings.audioCueLabel}</span>
          <button
            type="button"
            role="switch"
            aria-checked={state === "on"}
            aria-describedby={reduced ? `${descriptionId} ${reducedId}` : descriptionId}
            onClick={() => setState((prev) => (prev === "on" ? "off" : "on"))}
            disabled={reduced}
            className={`relative h-6 w-11 rounded-full border border-slate-700 transition ${
              state === "on" && !reduced ? "bg-indigo-600" : "bg-slate-800"
            } ${reduced ? "opacity-60" : ""}`}
          >
            <span
              className={`absolute left-0 top-0 m-1 h-4 w-4 rounded-full bg-white transition-transform ${
                state === "on" && !reduced ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </label>
      </div>
    </section>
  );
}
