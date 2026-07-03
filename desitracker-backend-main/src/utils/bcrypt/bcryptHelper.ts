import bcrypt from 'bcrypt';
import config from '../../config';

export const hashPassword = async (password: string) => {
  // Guard against a missing/typo'd BCRYPT_SALT_ROUNDS env (Number(undefined) -> NaN,
  // which makes bcrypt throw on every signup). Fall back to a safe cost factor of 12.
  const rounds = Number(config.saltRounds) || 12;
  return await bcrypt.hash(password, rounds);
};
