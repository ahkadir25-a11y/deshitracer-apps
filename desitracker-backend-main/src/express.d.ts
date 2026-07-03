import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      query: Record<string, string>;
      params: Record<string, string>;
    }
  }
}
