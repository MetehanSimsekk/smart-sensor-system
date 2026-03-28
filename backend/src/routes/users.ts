import { Router } from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize, hideSystemAdmin } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/', authenticate, hideSystemAdmin, getUsers);
router.put('/:id', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), updateUser);
router.delete('/:id', authenticate, authorize(UserRole.SYSTEM_ADMIN), deleteUser);

export default router;