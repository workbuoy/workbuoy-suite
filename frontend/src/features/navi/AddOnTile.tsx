import React from "react";

type Props = {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  onOpen: () => void;
  onToggle?: (next: boolean) => void;
  connectedLabel: string;
  disconnectedLabel: string;
  toggleOn: string;
  toggleOff: string;
};

export default function AddOnTile({
  name,
  icon,
  enabled,
  onOpen,
  onToggle,
  connectedLabel,
  disconnectedLabel,
  toggleOn,
  toggleOff,
}: Props) {
  return (
    <article
      aria-label={name}
      className="flex h-full flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left text-slate-100 transition hover:border-indigo-500/60"
    >
      <button
        onClick={onOpen}
        aria-label={name}
        className="flex flex-1 items-start gap-3 text-left"
      >
        <span aria-hidden className="text-2xl">{icon}</span>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="mt-2 inline-flex rounded-full border border-slate-700 px-2 py-1 text-xs">
            {enabled ? connectedLabel : disconnectedLabel}
          </div>
        </div>
      </button>
      <div className="mt-4 flex items-center justify-end">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? toggleOn : toggleOff}
          onClick={() => onToggle?.(!enabled)}
          className={`relative h-6 w-12 rounded-full border border-slate-700 transition ${
            enabled ? 'bg-indigo-600' : 'bg-slate-800'
          }`}
        >
          <span
            className={`absolute left-0 top-0 m-1 h-4 w-4 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </article>
  );
}