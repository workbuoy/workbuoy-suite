export type Contact = { id: string; name: string; email?: string; phone?: string; createdAt: string };
export function validateNewContact(b:any): asserts b is { name: string; email?: string; phone?: string } {
  if (!b || typeof b !== "object" || typeof b.name !== "string") {
    throw new Error("invalid_contact");
  }
}
