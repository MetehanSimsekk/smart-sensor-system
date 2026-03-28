import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import { AuthRequest } from '../middlewares/auth';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const where: any = { isActive: true };

    if (req.user?.role === UserRole.COMPANY_ADMIN) {
      where.companyId = req.user.companyId;
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password', 'apiKey'] }
    });

    const filtered = users.filter(u => u.role !== UserRole.SYSTEM_ADMIN);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, isActive, companyId } = req.body;

    const user = await User.findByPk(String(id));
    if (!user) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
      return;
    }

    await user.update({ name, role, isActive, companyId });
    res.json({ message: 'Kullanıcı güncellendi.' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id: String(id) } });
    res.json({ message: 'Kullanıcı silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};