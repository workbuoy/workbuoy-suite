export type Role = 'viewer'|'contributor'|'manager'|'admin';
export type EntityType = 'contact'|'opportunity';

export interface ActorCtx {
  role: Role;
  user_id: string;
  team_id?: string;
}

export interface RecordMeta {
  id: string;
  owner_id: string;
  team_id?: string;
  sensitive?: boolean;
  entity_type: EntityType;
  pipeline_id?: string;
}

export interface ActionCtx {
  action: 'read'|'create'|'update'|'delete';
  changes?: Record<string, any>;
}

export function canAccess(actor: ActorCtx, rec: RecordMeta|null, act: ActionCtx): { allow: boolean, reason?: string } {
  const r = actor.role;
  if (r === 'admin') return { allow: true };

  if (act.action === 'read') {
    if (r === 'viewer') {
      // viewer: can read non-sensitive OR same team
      if (rec && (rec.sensitive !== true || (!!actor.team_id && actor.team_id === rec.team_id))) return { allow: true };
      return { allow: false, reason: 'viewer.forbidden' };
    }
    if (r === 'contributor' || r === 'manager') return { allow: true };
  }

  if (act.action === 'create') {
    if (r === 'viewer') return { allow: false, reason: 'viewer.no_create' };
    if (r === 'contributor') {
      // contributor: must own what they create; cannot create sensitive
      if (act.changes?.owner_id && act.changes.owner_id !== actor.user_id) return { allow: false, reason: 'contrib.must_own' };
      if (act.changes?.sensitive) return { allow: false, reason: 'contrib.no_sensitive' };
      return { allow: true };
    }
    if (r === 'manager') return { allow: true };
  }

  if (act.action === 'update' || act.action === 'delete') {
    if (!rec) return { allow: false, reason: 'record.missing' };
    if (r === 'viewer') return { allow: false, reason: 'viewer.no_write' };

    if (r === 'contributor') {
      // may update only own, non-sensitive; cannot move across pipeline
      if (rec.owner_id !== actor.user_id) return { allow: false, reason: 'contrib.not_owner' };
      if (rec.sensitive) return { allow: false, reason: 'contrib.no_sensitive' };
      if (act.changes && 'pipeline_id' in act.changes && act.changes.pipeline_id !== rec.pipeline_id) {
        return { allow: false, reason: 'contrib.no_pipeline_move' };
      }
      return { allow: true };
    }

    if (r === 'manager') {
      // may update within same team; can change pipeline, including cross-pipeline
      if (!!actor.team_id && rec.team_id && actor.team_id !== rec.team_id) return { allow: false, reason: 'manager.not_team' };
      return { allow: true };
    }
  }

  return { allow: false, reason: 'unknown' };
}
