import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CustomerAttributes {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
  companyId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id' | 'isActive' | 'phone' | 'address' | 'taxNumber' | 'taxOffice'> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public phone!: string | null;
  public address!: string | null;
  public taxNumber!: string | null;
  public taxOffice!: string | null;
  public companyId!: string;
  public isActive!: boolean;
}

Customer.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  taxNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxOffice: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  tableName: 'customers'
});

export default Customer;
