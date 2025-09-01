export const Brand = {
  core:   { name: 'WorkBuoy Core',    pricing: '$9',   badge: 'continuous-assistant' },
  flex:   { name: 'WorkBuoy Flex',    pricing: '$15+', badge: 'professional-consultation' },
  secure: { name: 'WorkBuoy Secure',  pricing: 'enterprise', badge: 'enterprise-compliance' },
};

export function brandFor(moduleType='core'){
  const b = Brand[moduleType] || Brand.core;
  return { ...b, moduleType };
}