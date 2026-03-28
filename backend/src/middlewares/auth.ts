import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    companyId: string | null;
  };
}

// JWT doğrulama
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;

    // API Key kontrolü
    if (apiKey) {
      const user = await validateApiKey(apiKey);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // JWT kontrolü
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Yetkilendirme gerekli.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: UserRole;
      companyId: string | null;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token.' });
  }
};

// Rol kontrolü
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Yetkilendirme gerekli.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
      return;
    }
    next();
  };
};

// System Admin görünmezlik kontrolü
export const hideSystemAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== UserRole.SYSTEM_ADMIN) {
    req.query.excludeSystemAdmin = 'true';
  }
  next();
};

// API Key doğrulama
const validateApiKey = async (apiKey: string) => {
  try {
    const User = require('../models/User').default;
    const user = await User.findOne({ where: { apiKey, isActive: true } });
    if (!user) return null;
    return { id: user.id, role: user.role, companyId: user.companyId };
  } catch {
    return null;
  }
};