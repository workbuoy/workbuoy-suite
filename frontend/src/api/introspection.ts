import { apiFetch } from '@/api';

export async function fetchIntrospectionReport(){
  return apiFetch('/api/introspection');
}
