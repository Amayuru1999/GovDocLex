import 'express';
import { IUser } from './index.ts';

declare module 'express-serve-static-core' {
  interface Request {
    user?: Partial<IUser> | null;
  }
}