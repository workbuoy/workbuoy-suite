const nbDays = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
const enDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nextDow(target: number, from = new Date()) {
  const d = new Date(from);
  const diff = (target + 7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function extractTime(value: string): string | undefined {
  const match = value.match(/(\d{1,2})([:.]?(\d{2}))?/);
  const hours = match?.[1];
  if (!hours) return undefined;
  const minutes = match?.[3] ?? "00";
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

export function parseNaturalDate(text: string): { date: string; time?: string } | null {
  const v = text.trim().toLowerCase();

  if (/(tomorrow|i morgen|imorgen)/.test(v)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const time = extractTime(v);
    return { date: toISODate(d), time };
  }

  const parts = v.split(/\s+/);
  if (parts.length >= 1) {
    const [firstPart] = parts;
    if (!firstPart) return null;
    const day = firstPart.slice(0, 3);
    let idx = nbDays.indexOf(day);
    if (idx === -1) idx = enDays.indexOf(day);
    if (idx !== -1) {
      const d = nextDow(idx);
      const time = extractTime(v);
      return { date: toISODate(d), time };
    }
  }

  const md = v.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/);
  if (md) {
    const now = new Date();
    const dayPart = md[1];
    const monthPart = md[2];
    if (!dayPart || !monthPart) return null;
    const day = parseInt(dayPart, 10);
    const month = parseInt(monthPart, 10);
    const year = md[3] ? parseInt(md[3], 10) : now.getFullYear();
    const date = toISODate(new Date(year, month - 1, day));
    const time = extractTime(v);
    return { date, time };
  }

  return null;
}