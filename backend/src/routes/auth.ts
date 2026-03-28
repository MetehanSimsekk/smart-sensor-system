import { Router } from 'express';
import { login, register, generateApiKey, me } from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/login', login);
router.post('/register', authenticate, authorize(UserRole.SYSTEM_ADMIN), register);
router.post('/api-key', authenticate, generateApiKey);
router.get('/me', authenticate, me);

export default router;