import Company from './Company';
import Customer from './Customer';
import User from './User';
import Sensor from './Sensor';
import UserLog from './UserLog';
import UserSensor from './UserSensor';

Company.hasMany(Customer, {
  foreignKey: 'companyId',
  as: 'customers'
});

Customer.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company'
});


export { Company, Customer, User, Sensor, UserLog, UserSensor };
