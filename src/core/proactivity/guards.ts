import { ProactivityMode, modeToKey } from './modes';
import type { ProactivityState } from './context';

type BasicRequest = { proactivity?: ProactivityState; [key: string]: any };
type BasicResponse = { status: (code: number) => BasicResponse; json: (body: any) => any };
type Next = () => any;

export function requiresProMode(required: ProactivityMode) {
  return (req: BasicRequest, res: BasicResponse, next: Next) => {
    const state = req.proactivity;
    if (!state || state.effective < required) {
      return res.status(403).json({
        error: 'proactivity_required',
        required: modeToKey(required),
        actual: state ? modeToKey(state.effective) : 'none',
        basis: state?.basis ?? [],
      });
    }
    return next();
  };
}
