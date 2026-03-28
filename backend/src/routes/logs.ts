import { Router } from 'express';
import { createLog, getLogs, getLogAnalytics } from '../controllers/logController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/', authenticate, createLog);
router.get('/', authenticate, getLogs);
router.get('/analytics', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), getLogAnalytics);

export default router;