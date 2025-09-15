export enum AutonomyLevel { L1=1, L2, L3, L4, L5, L6 }
export const currentLevel = () => Number(process.env.AUTONOMY_LEVEL ?? 1);
export const allows = (min: AutonomyLevel) => currentLevel() >= min;
