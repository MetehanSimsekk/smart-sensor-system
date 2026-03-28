import Company from './Company';
import Customer from './Customer';
import User from './User';
import Sensor from './Sensor';
import UserLog from './UserLog';
import UserSensor from './UserSensor';

// Set up associations
Company.hasMany(Customer, {
  foreignKey: 'companyId',
  as: 'customers'
});

Customer.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company'
});

// Other existing associations would be set up here as well

export { Company, Customer, User, Sensor, UserLog, UserSensor };
