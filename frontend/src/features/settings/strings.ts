export const preferencesStrings = {
  title: "Innstillinger",
  groups: {
    audio: "Varsler og lyd",
    integrations: "Integrasjonspaneler",
    accessibility: "Tilgjengelighet",
  },
  toggles: {
    audioCues: {
      label: "Diskré lydhint",
      description: "Spill korte signaler når viktige hendelser skjer.",
    },
    reducedSound: {
      label: "Redusert lyd",
      description: "Demp eller slå av lyd fra WorkBuoy.",
    },
    enableO365Panel: {
      label: "O365-panel",
      description: "Vis Outlook og kalenderstubber inne i Navi.",
    },
    enableCollabPanel: {
      label: "Teams & Slack",
      description: "Forhåndsvis nye tråder og meldinger i demo-panelet.",
    },
    enableGwsPanel: {
      label: "Google Workspace",
      description: "Vis siste dokumenter og utkast fra Workspace.",
    },
    enableVismaPanel: {
      label: "Visma innsikt",
      description: "Slå på KPI-oversikten for ERP-demoen.",
    },
    reducedMotion: {
      label: "Redusert animasjon",
      description: "Tone ned overgangene og bevegelse i grensesnittet.",
    },
  },
  meta: {
    systemLock: "Styrt av systemet",
    systemLockSound: "Operativsystemet ber apper redusere lyd. Audio cues holdes av.",
    systemLockMotion: "Operativsystemet ber apper redusere animasjoner.",
    audioDisabled: "Audio cues er deaktivert når redusert lyd er aktiv.",
    reducedSoundHint: "Perfekt for stille soner eller skjermdeling.",
    reducedMotionHint: "Gir roligere demoer og lettere fokus.",
  },
  footnote: "Endringer lagres lokalt og påvirker kun denne nettleseren.",
};

export type PreferencesStrings = typeof preferencesStrings;
