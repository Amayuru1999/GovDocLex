import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string | undefined;
  googleId?: string | undefined;
  authMethod: 'local' | 'google';
  isVerified?: boolean;
  resetPasswordToken?: string | undefined;
  resetPasswordExpires?: Date | undefined;
  passwordChangedAt?: Date | undefined;
}

export interface IChat extends Document {
  userId: Types.ObjectId | string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  context?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDocument extends Document {
  userId: Types.ObjectId | string;
  filename: string;
  originalName: string;
  filePath: string;
  size: number;
  uploadDate?: Date;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string | null;
  chromaCollection?: string | null;
  chunksCount?: number;
}