import { Response } from 'express';
import config from '../../config';

export const setCookie = (token: string, res: Response) => {
  // set refresh token to cookie
  res.cookie('accessToken', token, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
};
