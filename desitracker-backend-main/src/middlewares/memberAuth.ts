// middlewares/memberAuth.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt, { type Secret } from 'jsonwebtoken';
import { config } from './config';

// Use this in controllers where you need req.member
export interface MemberAuthRequest extends Request {
  member?: { id: string };
}

interface MemberJwtPayload {
  id: string;
  type: 'member';
  iat?: number;
  exp?: number;
}

export const requireMemberAuth: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  let payload: MemberJwtPayload;
  try {
    // Ensure secret is typed as jwt.Secret
    const secret = config.memberJwtSecret as unknown as Secret;
    payload = jwt.verify(token, secret) as MemberJwtPayload;
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  if (payload.type !== 'member') {
    res.status(401).json({ message: 'Invalid token type' });
    return;
  }

  // Cast to your extended request to attach member
  (req as MemberAuthRequest).member = { id: payload.id };
  next();
};
