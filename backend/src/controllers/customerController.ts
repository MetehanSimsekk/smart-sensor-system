import { Request, Response } from 'express';
import Customer from '../models/Customer';
import Company from '../models/Company';
import { AuthRequest } from '../middlewares/auth';

// Müşteri oluştur (sadece system_admin)
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address, taxNumber, taxOffice, companyId } = req.body;

    // Şirket var mı kontrol et
    const company = await Company.findByPk(companyId);
    if (!company) {
      res.status(404).json({ error: 'Şirket bulunamadı.' });
      return;
    }

    // Email zaten kayıtlı mı kontrol et
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      res.status(400).json({ error: 'Bu email zaten kayıtlı.' });
      return;
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      taxNumber,
      taxOffice,
      companyId
    });

    res.status(201).json({
      message: 'Müşteri başarıyla oluşturuldu.',
      customer
    });
  } catch (error) {
    console.error('Müşteri oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Müşterileri getir
export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.query;

    let whereClause: any = { isActive: true };
    
    // Eğer companyId belirtilmişse, sadece o şirketin müşterilerini getir
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const customers = await Customer.findAll({
      where: whereClause,
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name'],
        required: true
      }]
    });

    res.json(customers);
  } catch (error) {
    console.error('Müşterileri getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Müşteri güncelle
export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { name, email, phone, address, taxNumber, taxOffice, isActive } = req.body;

    const customer = await Customer.findByPk(idStr);
    if (!customer) {
      res.status(404).json({ error: 'Müşteri bulunamadı.' });
      return;
    }

    // Email değiştiriliyorsa ve başka bir müşteride var mı kontrol et
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({ where: { email } });
      if (existingCustomer) {
        res.status(400).json({ error: 'Bu email zaten kayıtlı.' });
        return;
      }
    }

    await customer.update({
      name,
      email,
      phone,
      address,
      taxNumber,
      taxOffice,
      isActive
    });

    res.json({
      message: 'Müşteri güncellendi.',
      customer
    });
  } catch (error) {
    console.error('Müşteri güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Müşteri sil
export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const customer = await Customer.findByPk(idStr);
    if (!customer) {
      res.status(404).json({ error: 'Müşteri bulunamadı.' });
      return;
    }

    await customer.update({ isActive: false });

    res.json({ message: 'Müşteri silindi.' });
  } catch (error) {
    console.error('Müşteri silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
