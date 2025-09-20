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
};
export type DealsStrings = typeof dealsStrings;
