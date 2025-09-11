export function maskValue(value: string): string {
  if (!value) return value;
  // Mask email addresses by revealing first two characters and masking the rest and domain details.
  const emailMasked = value.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, (email) => {
    const [local, domain] = email.split('@');
    const tld = domain.split('.').pop() || '';
    const maskedLocal = local.slice(0, 2) + '***';
    return `${maskedLocal}@***.${tld}`;
  });
  // Mask phone numbers (8+ digits) by replacing digits with '*'
  return emailMasked.replace(/\b\d[\d\s.-]{7,}\d\b/g, (phone) => phone.replace(/\d/g, '*'));
}
