import bcrypt from 'bcrypt';
import config from '../../config';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, Number(config.saltRounds));
};
