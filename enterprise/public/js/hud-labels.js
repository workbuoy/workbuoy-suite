// Map internal states to friendly labels (tooltips preserve technical explainability)
export const HUD_LABELS = {
  never: 'Initial insights',
  baseline: 'Recent baseline',
  visit: 'Latest updates',
};
export const HUD_TOOLTIPS = {
  never: 'No prior interactions — using global + cohort priors.',
  baseline: 'Incorporates recent trends since your last baseline.',
  visit: 'Includes your latest feedback and signals.',
};
if(typeof window!=='undefined'){ window.WB_HUD_LABELS = HUD_LABELS; window.WB_HUD_TOOLTIPS = HUD_TOOLTIPS; }
