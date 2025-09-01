'use strict';
function filterIncremental(arr, since, field){
  if (!since) return arr;
  const s = typeof since === 'number' ? since : Date.parse(since);
  return (arr || []).filter(x => {
    const v = x[field] || x[field?.toLowerCase?.()] || x['updated_at'] || x['lastModifiedDateTime'];
    const t = typeof v === 'number' ? v : Date.parse(v);
    return !isNaN(t) && t > s;
  });
}
module.exports = { filterIncremental };
