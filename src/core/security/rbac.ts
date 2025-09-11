import type { Request, Response, NextFunction } from "express";

type Role = "admin" | "operator" | "viewer" | "anon";

export function rbac(allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.headers["x-role-id"] as string) as Role || "anon";
    if (!allowed.includes(role)) {
      return res.status(403).json({ error: "rbac_denied", message: `role '${role}' not allowed` });
    }
    next();
  };
}
