export const isCrmEnabled = () => {
  const v = process.env.WB_FEATURE_CRM;
  return v === undefined || v === '' || v === '1' || v?.toLowerCase() === 'true';
};
