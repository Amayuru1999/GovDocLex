import { Request, Response } from 'express';
import {
  localSignup,
  localSignIn,
  googleAuth,
  findUserById,
  requestPasswordReset,
  resetPassword,
} from '../services/authService.js';

const localSignupController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as any;
    const { user, token } = await localSignup(name, email, password);
    res.status(201).json({
      status: true,
      message: 'Account created successfully',
      token,
    });
  } catch (error: any) {
    res.status(400).json({ status: false, message: error.message });
  }
};

const localSignInController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as any;
    const { user, token } = await localSignIn(email, password);
    const userResponse = { ...(user as any)._doc } as any;
    delete userResponse.password;
    res.json({
      status: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(400).json({ status: false });
  }
};

export const googleAuthController = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body as any;
    const { user, token } = await googleAuth(credential);

    res.status(200).json({
      token,
      user: {
        _id: (user as any)._id,
        email: (user as any).email,
        authMethod: (user as any).authMethod,
        isVerified: (user as any).isVerified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Google login failed' });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as any;
    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};


export const handleResetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params as any;
    const { password } = req.body as any;
    const result = await resetPassword(token, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export {
  localSignupController as localSignup,
  localSignInController as localSignIn,
  googleAuthController as googleAuth,
};
