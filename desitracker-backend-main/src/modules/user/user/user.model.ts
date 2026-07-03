// const mongoose = require("mongoose");
import bcrypt from 'bcrypt';
import validator from 'validator';
// const jwt = require("jsonwebtoken");

import mongoose from 'mongoose';
import { hashPassword } from '../../../utils/bcrypt/bcryptHelper';
import { TContact, TUser, UserModel } from './user.interface';

const contactSchema = new mongoose.Schema<TContact>(
  {
    address: { type: String, trim: true },
    subArea: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
    },
    userStatus: {
      type: String,
      enum: ['new', 'suspicious', 'verified'],
      default: 'new',
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [8, 'Password should be greater than 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please enter your phone number'],
      validate: [validator.isMobilePhone, 'Please enter a valid phone number'],
      // Indexed because login can look users up by phone. Not `unique` yet —
      // existing data may contain duplicates; dedupe before adding uniqueness.
      index: true,
    },
    fbProfile: {
      type: String,
      trim: true,
    },
    profilePic: {
      type: String,
      trim: true,
    },
    coverPhotoUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'business_owner', 'staff'],
        message:
          '{VALUE} is not a valid role. Allowed roles are: user, admin, business_owner, staff.',
      },
      default: 'business_owner',
    },
    contact: {
      type: contactSchema,
    },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    expoPushToken: { type: String, default: null },
    // 6-digit numeric code for in-app password reset (no web link). Cleared
    // once used or expired. `select: false` so it never leaks in normal reads.
    passwordResetCode: { type: String, select: false, default: null },
    passwordResetCodeExpires: { type: Date, select: false, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        Reflect.deleteProperty(ret, "password");
        return ret;
      },
    },

  },
);

// Hash password before save
userSchema.pre('validate', async function (next) {
  const user = this as any;
  if (!user.isModified('password')) {
    return next();
  }
  user.password = await hashPassword(user.password);

  next();
});

// Hash password before update
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as Record<string, any>;

  if (update?.password) {
    update.password = await hashPassword(update.password);

    this.setUpdate(update);
  }
  next();
});

// static method to Compare Password
userSchema.statics.comparePassword = async function (
  password: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(password, hashedPassword);
};

// Static method to find user by _id
userSchema.statics.isUserExists = function (id: string) {
  return this.findById(id);
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

// Static method to find user by phone number
userSchema.statics.findByPhone = function (phone) {
  return this.findOne({ phone });
};

// Set profile picture URL
userSchema.methods.setProfilePictureUrl = function (url: string) {
  this.profilePic = url;
};

export const User = mongoose.model<TUser, UserModel>('User', userSchema);
