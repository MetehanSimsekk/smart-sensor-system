import { connectDB } from './database';
import User, { UserRole } from '../models/User';
import Company from '../models/Company';

const seed = async () => {
  await connectDB();

  const [patrion] = await Company.findOrCreate({
    where: { name: 'Patrion' },
    defaults: { name: 'Patrion', description: 'Ana şirket' }
  });

  await User.findOrCreate({
    where: { email: 'admin@patrion.com' },
    defaults: {
      name: 'System Admin',
      email: 'admin@patrion.com',
      password: 'Patrion2026',
      role: UserRole.SYSTEM_ADMIN,
      companyId: null,
      isActive: true
    }
  });

  await User.findOrCreate({
    where: { email: 'company@patrion.com' },
    defaults: {
      name: 'Company Admin',
      email: 'company@patrion.com',
      password: '1234',
      role: UserRole.COMPANY_ADMIN,
      companyId: patrion.id,
      isActive: true
    }
  });

  await User.findOrCreate({
    where: { email: 'user@patrion.com' },
    defaults: {
      name: 'Test User',
      email: 'user@patrion.com',
      password: '1234',
      role: UserRole.USER,
      companyId: patrion.id,
      isActive: true
    }
  });


  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});