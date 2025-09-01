export function requireRole(user, roles=['user']) {
  if(!user) return false;
  if(user.roles && roles.some(r => user.roles.includes(r))) return true;
  return false;
}
export function checkPolicy(user, action){
  const policies = user?.policies || {};
  const denied = policies?.denied_actions || [];
  return !denied.includes(action);
}
