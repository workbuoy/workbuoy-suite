export type MergeStrategy = 'lww'|'field-merge';

export function resolveConflict(local: any, remote: any, strategy: MergeStrategy = 'lww') {
  if (strategy === 'lww') {
    return (local.updated_at || 0) >= (remote.updated_at || 0) ? local : remote;
  }
  // field-merge: merge custom_fields shallowly, prefer local for conflicts
  const merged = { ...remote, ...local };
  if (remote.custom_fields || local.custom_fields) {
    merged.custom_fields = { ...(remote.custom_fields||{}), ...(local.custom_fields||{}) };
  }
  return merged;
}
