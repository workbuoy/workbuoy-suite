

export function isWb2WbEnabled() {
  const v = (process.env.WB_WB2WB_ENABLED || 'true').toLowerCase();
  return v === 'true';
}
export function wb2wbMode() {
  return (process.env.WB_WB2WB_MODE || 'silent').toLowerCase();
}
