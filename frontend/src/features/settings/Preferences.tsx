import React, { useEffect } from "react";
import { audioCue } from "@/features/peripheral/AudioCue";
import { preferencesStrings as strings } from "./strings";
import {
  useSettings,
  toggleSetting,
  type SettingsKey,
  type SettingsState,
} from "@/store/settings";
import "./preferences.css";
import { useDemoMode } from "@/features/demo/useDemoMode";

type ToggleDescriptor = {
  key: SettingsKey;
  label: string;
  description: string;
  disabled?: (state: SettingsState) => boolean;
  meta?: (state: SettingsState) => string[];
};

type ToggleGroup = {
  id: string;
  title: string;
  toggles: ToggleDescriptor[];
};

const GROUPS: ToggleGroup[] = [
  {
    id: "audio",
    title: strings.groups.audio,
    toggles: [
      {
        key: "audioCues",
        label: strings.toggles.audioCues.label,
        description: strings.toggles.audioCues.description,
        disabled: (state) => state.reducedSound,
        meta: (state) => {
          if (!state.reducedSound) return [];
          return [strings.meta.audioDisabled];
        },
      },
      {
        key: "reducedSound",
        label: strings.toggles.reducedSound.label,
        description: strings.toggles.reducedSound.description,
        disabled: (state) => state.systemReducedSound,
        meta: (state) => {
          const notes = [strings.meta.reducedSoundHint];
          if (state.systemReducedSound) {
            notes.unshift(`${strings.meta.systemLock}: ${strings.meta.systemLockSound}`);
          }
          return notes;
        },
      },
    ],
  },
  {
    id: "integrations",
    title: strings.groups.integrations,
    toggles: [
      {
        key: "enableO365Panel",
        label: strings.toggles.enableO365Panel.label,
        description: strings.toggles.enableO365Panel.description,
      },
      {
        key: "enableCollabPanel",
        label: strings.toggles.enableCollabPanel.label,
        description: strings.toggles.enableCollabPanel.description,
      },
      {
        key: "enableGwsPanel",
        label: strings.toggles.enableGwsPanel.label,
        description: strings.toggles.enableGwsPanel.description,
      },
      {
        key: "enableVismaPanel",
        label: strings.toggles.enableVismaPanel.label,
        description: strings.toggles.enableVismaPanel.description,
      },
    ],
  },
  {
    id: "accessibility",
    title: strings.groups.accessibility,
    toggles: [
      {
        key: "reducedMotion",
        label: strings.toggles.reducedMotion.label,
        description: strings.toggles.reducedMotion.description,
        disabled: (state) => state.systemReducedMotion,
        meta: (state) => {
          const notes = [strings.meta.reducedMotionHint];
          if (state.systemReducedMotion) {
            notes.unshift(`${strings.meta.systemLock}: ${strings.meta.systemLockMotion}`);
          }
          return notes;
        },
      },
    ],
  },
];

function PreferenceToggle({ descriptor, state }: { descriptor: ToggleDescriptor; state: SettingsState }) {
  const id = React.useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const metaTexts = descriptor.meta?.(state) ?? [];
  const metaId = metaTexts.length > 0 ? `${id}-meta` : undefined;
  const disabled = descriptor.disabled?.(state) ?? false;
  const checked = state[descriptor.key];
  const describedBy = metaId ? `${descriptionId} ${metaId}` : descriptionId;

  function handleToggle() {
    if (disabled) return;
    toggleSetting(descriptor.key);
  }

  return (
    <div className="settings-row">
      <div className="settings-row__body">
        <span id={labelId} className="settings-row__label">
          {descriptor.label}
        </span>
        <p id={descriptionId} className="settings-row__description">
          {descriptor.description}
        </p>
        {metaTexts.length > 0 ? (
          <div id={metaId} className="settings-row__meta">
            {metaTexts.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className="settings-switch"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        data-state={checked ? "on" : "off"}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span aria-hidden="true" className="settings-switch__track" />
        <span aria-hidden="true" className="settings-switch__thumb" />
      </button>
    </div>
  );
}

export default function Preferences() {
  const settings = useSettings((state) => state);
  const { active: demoActive, start: startDemo, stop: stopDemo } = useDemoMode();

  useEffect(() => {
    const enabled = settings.audioCues && !settings.reducedSound && !settings.systemReducedSound;
    audioCue.setEnabled(enabled);
  }, [settings.audioCues, settings.reducedSound, settings.systemReducedSound]);

  return (
    <section className="settings-panel" aria-labelledby="settings-preferences-heading">
      <header className="settings-panel__header">
        <h2 id="settings-preferences-heading" className="settings-panel__title">
          {strings.title}
        </h2>
      </header>
      <div className="settings-panel__groups">
        {GROUPS.map((group) => (
          <div key={group.id} className="settings-group" role="group" aria-labelledby={`${group.id}-heading`}>
            <h3 id={`${group.id}-heading`} className="settings-group__title">
              {group.title}
            </h3>
            {group.toggles.map((toggle) => (
              <PreferenceToggle key={toggle.key} descriptor={toggle} state={settings} />
            ))}
          </div>
        ))}
      </div>
      <footer className="settings-panel__footer">
        <p className="settings-panel__footnote">{strings.footnote}</p>
        <div className="settings-panel__demo">
          <button type="button" onClick={demoActive ? stopDemo : startDemo} aria-pressed={demoActive}>
            {demoActive ? strings.demo.stop : strings.demo.start}
          </button>
          <span className="settings-panel__demo-status" role="status" aria-live="polite">
            {demoActive ? strings.demo.statusOn : strings.demo.statusOff}
          </span>
        </div>
      </footer>
    </section>
  );
}
