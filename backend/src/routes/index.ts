import express from 'express';
import authRoutes from './authRoutes.js';
import documentsRoutes from './documents.js';

const router = express.Router();

router.use('/', authRoutes as any);
router.use('/documents', documentsRoutes as any);

export default router;
