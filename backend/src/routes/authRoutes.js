import express from "express";
import {
  localSignup,
  localSignIn,
  googleAuth,
  getUserByIdController,
  forgotPassword,
  handleResetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", localSignup);
router.post("/signin", localSignIn);
router.post("/google-auth", googleAuth);
router.get("/user/:id", getUserByIdController);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", handleResetPassword);

export default router;
