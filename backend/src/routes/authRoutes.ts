import express from 'express';
import {
  localSignup,
  localSignIn,
  googleAuth,
  getUserByIdController,
  forgotPassword,
  handleResetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', localSignup as any);
router.post('/signin', localSignIn as any);
router.post('/google-auth', googleAuth as any);
router.get('/user/:id', getUserByIdController as any);
router.post('/forgot-password', forgotPassword as any);
router.post('/reset-password/:token', handleResetPassword as any);

export default router;
