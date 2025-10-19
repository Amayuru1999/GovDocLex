import mongoose, { Schema } from 'mongoose';
import type { IUser } from '../types/index.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, match: emailRegex },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.authMethod === 'local';
      },
      minlength: 8,
    },
    googleId: { type: String, unique: true, sparse: true },
    authMethod: { type: String, enum: ['local', 'google'], default: 'local' },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
