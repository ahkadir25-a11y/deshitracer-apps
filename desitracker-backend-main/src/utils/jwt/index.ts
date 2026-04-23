import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';

export type TJwtPayload = {
  id: string;
  role: string;
  email: string;
};

const createToken = (
  jwtPayloadData: TJwtPayload,
  jwtSecret: string,
  expiresIn: string | number | any,
) => jwt.sign(jwtPayloadData, jwtSecret, { expiresIn });

const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (err) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }
};

export const JwtHelpers = {
  createToken,
  verifyToken,
};
