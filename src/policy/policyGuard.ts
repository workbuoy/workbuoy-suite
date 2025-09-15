import { Request, Response, NextFunction } from "express";

export function policyGuardWrite(req: Request, res: Response, next: NextFunction){
  const autonomy = req.wb?.autonomy ?? 0;
  if (autonomy < 1){
    return res.status(403).json({
      error: "forbidden",
      explanations: [
        { title:"Autonomi", quote:"Nivå 0 tillater ikke skriving", source:"Policy" }
      ]
    });
  }
  next();
}