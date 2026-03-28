import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SensorAttributes {
  id: string;
  sensorId: string;
  name: string;
  type: string;
  companyId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SensorCreationAttributes extends Optional<SensorAttributes, 'id' | 'isActive'> {}

class Sensor extends Model<SensorAttributes, SensorCreationAttributes> implements SensorAttributes {
  public id!: string;
  public sensorId!: string;
  public name!: string;
  public type!: string;
  public companyId!: string;
  public isActive!: boolean;
}

Sensor.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sensorId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  tableName: 'sensors'
});

export default Sensor;