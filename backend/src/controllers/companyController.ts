import { Request, Response } from 'express';
import Company from '../models/Company';
import User, { UserRole } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import UserSensor from '../models/UserSensor';
import Sensor from '../models/Sensor';
// Şirket oluştur (sadece system_admin)
export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const existing = await Company.findOne({ where: { name } });
    if (existing) {
      res.status(400).json({ error: 'Bu şirket adı zaten kayıtlı.' });
      return;
    }
    const company = await Company.create({ name, description });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Şirketleri getir
export const getCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const companies = await Company.findAll({ where: { isActive: true } });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Şirket güncelle
export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    const idStr = Array.isArray(id) ? id[0] : id;
    
    const company = await Company.findByPk(idStr);
    if (!company) {
      res.status(404).json({ error: 'Şirket bulunamadı.' });
      return;
    }
    await company.update({ name, description, isActive });
    res.json({ message: 'Şirket güncellendi.', company });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Şirkete kullanıcı ekle
export const addUserToCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { name, email, password, role } = req.body;

    const companyIdStr = Array.isArray(companyId) ? companyId[0] : companyId;

    // company_admin sadece kendi şirketine ekleyebilir
    if (req.user?.role === UserRole.COMPANY_ADMIN && req.user.companyId !== companyIdStr) {
      res.status(403).json({ error: 'Sadece kendi şirketinize kullanıcı ekleyebilirsiniz.' });
      return;
    }

    // company_admin sadece user rolü ekleyebilir
    if (req.user?.role === UserRole.COMPANY_ADMIN && role !== UserRole.USER) {
      res.status(403).json({ error: 'Sadece user rolü ekleyebilirsiniz.' });
      return;
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'Bu email zaten kayıtlı.' });
      return;
    }

    const company = await Company.findByPk(companyIdStr);
    if (!company) {
      res.status(404).json({ error: 'Şirket bulunamadı.' });
      return;
    }

    const user = await User.create({ name, email, password, role: role || UserRole.USER, companyId: companyIdStr });
    res.status(201).json({
      message: 'Kullanıcı oluşturuldu.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Şirketin kullanıcılarını getir
export const getCompanyUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    const companyIdStr = Array.isArray(companyId) ? companyId[0] : companyId;

    // company_admin sadece kendi şirketini görebilir
    if (req.user?.role === UserRole.COMPANY_ADMIN && req.user.companyId !== companyIdStr) {
      res.status(403).json({ error: 'Yetkisiz erişim.' });
      return;
    }

    const users = await User.findAll({
      where: { companyId: companyIdStr, isActive: true },
      attributes: { exclude: ['password', 'apiKey'] }
    });

    // system_admin hiçbir zaman listelenmez
    const filtered = users.filter(u => u.role !== UserRole.SYSTEM_ADMIN);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const assignSensorToUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, sensorId } = req.body;
    const { companyId } = req.params;

    if (req.user?.role === UserRole.COMPANY_ADMIN && req.user.companyId !== companyId) {
      res.status(403).json({ error: 'Yetkisiz erişim.' });
      return;
    }

    const existing = await UserSensor.findOne({ where: { userId, sensorId } });
    if (existing) {
      res.status(400).json({ error: 'Bu sensör zaten atanmış.' });
      return;
    }

    await UserSensor.create({ userId, sensorId });
    res.status(201).json({ message: 'Sensör atandı.' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const removeSensorFromUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, sensorId } = req.params;
    await UserSensor.destroy({ where: { userId, sensorId } });
    res.json({ message: 'Sensör kaldırıldı.' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const getUserSensors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const userSensors = await UserSensor.findAll({ where: { userId } });
    const sensorIds = userSensors.map(us => us.sensorId);
    const sensors = await Sensor.findAll({ where: { id: sensorIds, isActive: true } });
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};