import { Router } from 'express';
import { getUserSensors } from '../controllers/companyController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Kullanıcı kendi sensörlerini çekebilir
router.get('/sensors', authenticate, getUserSensors);

export default router;
