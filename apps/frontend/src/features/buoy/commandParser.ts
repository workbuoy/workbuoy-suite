export type ParsedIntent =
  | { kind: "tasks.list"; range?: "last_week"|"this_week"|"today"; assignee?: string }
  | { kind: "contacts.find"; name?: string }
  | { kind: "emails.search"; query: string }
  | { kind: "invoices.list"; status?: "due"|"overdue"|"paid"; range?: "last_month"|"this_month" }
  | { kind: "search"; query: string }
  | { kind: "unknown"; text: string };

const WEEK_WORDS = /last week|forrige uke|lastweek/i;
const THIS_WEEK = /this week|denne uken/i;
const TODAY = /today|i dag|idag/i;

export function parseCommand(input: string): ParsedIntent {
  const text = input.trim();

  // tasks last week
  if (/^(show|list|vis)\s+(me\s+)?(my\s+)?tasks?/i.test(text) && WEEK_WORDS.test(text)) {
    return { kind: "tasks.list", range: "last_week" };
  }
  if (/^(show|list|vis)\s+(me\s+)?(my\s+)?tasks?/i.test(text) && THIS_WEEK.test(text)) {
    return { kind: "tasks.list", range: "this_week" };
  }
  if (/^(show|list|vis)\s+(me\s+)?(my\s+)?tasks?/i.test(text) && TODAY.test(text)) {
    return { kind: "tasks.list", range: "today" };
  }

  // contacts
  const mContact = text.match(/^(find|show|vis)\s+(contact|kontakt)\s+(.+)/i);
  if (mContact) {
    return { kind: "contacts.find", name: mContact[3] };
  }

  // emails
  if (/^(search|søk)\s+(emails|e-post)/i.test(text)) {
    const q = text.replace(/^(search|søk)\s+(emails|e-post)/i, "").trim();
    return { kind: "emails.search", query: q || "*" };
  }

  // invoices
  if (/^(show|vis)\s+(invoices|faktura)/i.test(text)) {
    let status: "due"|"overdue"|"paid"|undefined;
    if (/overdue|forfalt/i.test(text)) status = "overdue";
    else if (/paid|betalt/i.test(text)) status = "paid";
    else if (/due|forfall/i.test(text)) status = "due";
    let range: "last_month"|"this_month"|undefined;
    if (/last month|forrige måned/i.test(text)) range = "last_month";
    else if (/this month|denne måneden/i.test(text)) range = "this_month";
    return { kind: "invoices.list", status, range };
  }

  // generic search
  if (/^(search|søk)\s+/.test(text)) {
    return { kind: "search", query: text.replace(/^(search|søk)\s+/i, "") };
  }

  return { kind: "unknown", text };
}