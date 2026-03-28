import { Router } from 'express';
import {
  createCompany,
  getCompanies,
  updateCompany,
  addUserToCompany,
  getCompanyUsers,
  assignSensorToUser,
  removeSensorFromUser,
  getUserSensors
} from '../controllers/companyController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), getCompanies);
router.post('/', authenticate, authorize(UserRole.SYSTEM_ADMIN), createCompany);
router.put('/:id', authenticate, authorize(UserRole.SYSTEM_ADMIN), updateCompany);
router.get('/:companyId/users', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), getCompanyUsers);
router.post('/:companyId/users', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), addUserToCompany);
router.get('/:companyId/users/:userId/sensors', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), getUserSensors);
router.post('/:companyId/users/:userId/sensors', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), assignSensorToUser);
router.delete('/:companyId/users/:userId/sensors/:sensorId', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), removeSensorFromUser);

export default router;