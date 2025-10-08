import express from "express";
import authRoutes from "./authRoutes.js";
import documentsRoutes from "./documents.js";

const router = express.Router();

router.use("/", authRoutes);
router.use("/documents", documentsRoutes);

export default router;
