type Role = 'admin'|'manager'|'contributor'|'viewer';
interface Binding { role: Role; resource: string; }

const bindings: Binding[] = [];

export function checkAccess(userRoles: Role[], resource: string, action: string): boolean {
  if(userRoles.includes('admin')) return true;
  for(const b of bindings){
    if(userRoles.includes(b.role) && b.resource===resource){
      if(b.role==='viewer' && action==='read') return true;
      if(b.role==='contributor' && (action==='read'||action==='write')) return true;
      if(b.role==='manager') return true;
    }
  }
  return false;
}

export function bindRole(role: Role, resource: string){
  bindings.push({role, resource});
}
