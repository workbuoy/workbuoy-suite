
export function maskPII(value: any): any {
  if (value == null) return value;
  const s = String(value);
  // Mask email
  const email = s.replace(/([A-Za-z0-9._%+-])([A-Za-z0-9._%+-]*)(@[^\s@]+\.[^\s@]{2,})/g,
    (_, a, mid, tail) => a + "***" + tail);
  // Mask phone-like
  const phone = email.replace(/\b\+?\d[\d\s-]{6,}\b/g, (m: string) => m.slice(0,2) + "***" + m.slice(-2));
  // Mask IBAN-ish
  const iban  = phone.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,}\b/g, (m: string) => m.slice(0,4) + "****" + m.slice(-4));
  // Mask SSN-like (naive)
  const ssn   = iban.replace(/\b\d{6}[- ]?\d{5}\b/g, (m: string) => m.slice(0,2) + "****" + m.slice(-2));
  return ssn;
}
