/**
 * lib/models/User.ts
 * Mongoose User model — roles: consumer | producer | certifier | distributor | retailer
 */

import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  /** bcrypt-hashed */
  passwordHash: string;
  role: 'consumer' | 'producer' | 'certifier' | 'distributor' | 'retailer';
  organization: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['consumer', 'producer', 'certifier', 'distributor', 'retailer'],
    },
    organization: { type: String, required: true, trim: true },
    avatar:       { type: String },
  },
  { timestamps: true }
);

// Prevent model re-compilation on hot reload
export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
