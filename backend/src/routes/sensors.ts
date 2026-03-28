import { Router } from 'express';
import { getSensors, createSensor, getSensorData, deleteSensor, getUserSensors, simulateSensorData } from '../controllers/sensorController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/', authenticate, getSensors);
router.post('/', authenticate, authorize(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN), createSensor);
router.get('/:sensorId/data', authenticate, getSensorData);
router.delete('/:id', authenticate, authorize(UserRole.SYSTEM_ADMIN), deleteSensor);
router.get('/users/:userId/sensors', authenticate, getUserSensors);
router.post('/simulate', authenticate, authorize(UserRole.SYSTEM_ADMIN), simulateSensorData);

export default router;