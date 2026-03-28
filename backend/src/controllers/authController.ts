import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User, { UserRole } from '../models/User';
import UserLog from '../models/UserLog';
import { AuthRequest } from '../middlewares/auth';

const generateToken = (user: { id: string; role: UserRole; companyId: string | null }) => {
  return jwt.sign(
    { id: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email ve şifre gerekli.' });
      return;
    }

    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) {
      res.status(401).json({ error: 'Geçersiz kimlik bilgileri.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Geçersiz kimlik bilgileri.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      companyId: user.companyId
    });

    await UserLog.create({
      userId: user.id,
      action: 'login',
      timestamp: new Date(),
      metadata: { ip: req.ip }
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, companyId } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'Bu email zaten kayıtlı.' });
      return;
    }

    const user = await User.create({ name, email, password, role, companyId });

    res.status(201).json({
      message: 'Kullanıcı oluşturuldu.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};


export const generateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apiKey = `sst_${uuidv4().replace(/-/g, '')}`;
    await User.update({ apiKey }, { where: { id: req.user!.id } });
    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};


export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ['password', 'apiKey'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};