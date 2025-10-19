import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const localSignup = async (name: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    provider: 'local',
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
  return { user, token };
};

export const localSignIn = async (email: string, password: string) => {

  if (typeof email !== 'string') {
    throw new Error('Invalid email format');
  }
  const user = await User.findOne({ email: { $eq: email } });
  // const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  if ((user as any).provider === 'google')
    throw new Error('This email is linked with Google. Use Google login.');

  const match = await bcrypt.compare(password, (user as any).password);
  if (!match) throw new Error('Invalid credentials');

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
  return { user, token };
};

export const googleAuth = async (googleToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload() as any;
  console.log('Google Auth Payload:', payload);

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      email: payload.email,
      name: payload.name,
      googleId: payload.sub,
      authMethod: 'google',
      password: undefined,
      isVerified: true,
    });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );

  return { user, token };
};

export const findUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password -googleId');
  return user;
};

export const requestPasswordReset = async (email: string) => {
  if (typeof email !== 'string') {
    throw new Error('Invalid email format');
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  (user as any).resetPasswordToken = resetTokenHash;
  (user as any).resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail(
    (user as any).email,
    'Password Reset Request',
    `
    <p>You requested to reset your password.</p>
    <p>Click this link to reset: <a href="${resetLink}">${resetLink}</a></p>
    <p>This link will expire in 15 minutes.</p>
    `
  );

  return { message: 'Password reset email sent' };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error('Invalid or expired token');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  (user as any).password = hashedPassword;

  (user as any).resetPasswordToken = undefined;
  (user as any).resetPasswordExpires = undefined;

  await user.save();

  return { message: 'Password has been reset successfully' };
};
