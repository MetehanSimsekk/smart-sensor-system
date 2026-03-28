import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/', authenticate, authorize(UserRole.SYSTEM_ADMIN), getCustomers);
router.post('/', authenticate, authorize(UserRole.SYSTEM_ADMIN), createCustomer);
router.put('/:id', authenticate, authorize(UserRole.SYSTEM_ADMIN), updateCustomer);
router.delete('/:id', authenticate, authorize(UserRole.SYSTEM_ADMIN), deleteCustomer);

export default router;
