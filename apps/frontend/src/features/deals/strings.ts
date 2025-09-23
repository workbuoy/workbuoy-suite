export const dealsStrings = {
  title: "Avtaler",
  status: "Status",
  value: "Verdi",
  contact: "Kontakt",
  id: "ID",
  toast: {
    statusChanged: (id: string, status: string) => `Avtale ${id} satt til ${status}`,
  },
  overlayToggle: "Tidslag",
  demo: {
    created: (contact: string) => `Demoavtale foreslått for ${contact}`,
    banner: (contact: string) =>
      `Demoen opprettet en avtale knyttet til ${contact}. Åpne hvorfor-panel for detaljer.`,
    closeWhy: "Skjul",
    whyHeader: "Auditsporet for demoavtalen",
    whyTitle: (contact: string) => `Hvorfor ${contact} er prioritert`,
    whyReason: (dealId: string, contact: string) =>
      `Avtale ${dealId} ble opprettet for å følge opp interessen ${contact} viste i forrige demo.`,
  },
};
export type DealsStrings = typeof dealsStrings;
