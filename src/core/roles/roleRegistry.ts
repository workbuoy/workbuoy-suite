export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export function getRoleById(roleId: string): Role | null {
  // TODO: fetch role details from roles.json or database
  return {
    id: roleId,
    name: 'default',
    permissions: [],
  };
}
