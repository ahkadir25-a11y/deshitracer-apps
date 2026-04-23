import { Model } from 'mongoose';

type TUserStatus = 'new' | 'suspicious' | 'verified';

type TRole = 'user' | 'admin' | 'business_owner';

export type TContact = {
  address: string;
  subArea: string;
  district: string;
  state: string;
  country: string;
};

export type TUser = {
  name: string;
  userStatus: TUserStatus;
  email: string;
  password: string;
  phone: string;
  fbProfile: string;
  profilePic: string;
  role: TRole;
  contact: TContact;
  isBlocked: boolean;
  isDeleted: boolean;
  profilePicUrl?: string
};

export interface UserModel extends Model<TUser> {
  isUserExists(id: string): Promise<TUser | null>;
  findByEmail(email: string): Promise<TUser | null>;
  findByPhone(phone: string): Promise<TUser | null>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  setProfilePictureUrl(url: string): void;
}

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
