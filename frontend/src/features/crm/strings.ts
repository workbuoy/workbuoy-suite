export const contactsStrings = {
  title: "Kontakter",
  addContact: "Legg til kontakt",
  idPlaceholder: "ID",
  namePlaceholder: "Navn",
  emailPlaceholder: "E-post",
  phonePlaceholder: "Telefon",
  save: "Lagre",
  saving: "Lagrer…",
  close: "Lukk",
  tableHeadings: {
    id: "ID",
    name: "Navn",
    email: "E-post",
    phone: "Telefon",
    actions: "Handlinger",
  },
  delete: "Slett",
  toast: {
    created: (name: string) => `Kontakt ${name} ble opprettet`,
    deleted: (name: string) => `Kontakt ${name} ble slettet`,
    cannotUndo: "Kan ikke angre for denne handlingen",
  },
  overlayToggle: "Tidslag",
};
export type ContactsStrings = typeof contactsStrings;
