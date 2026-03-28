import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserSensorAttributes {
  id: string;
  userId: string;
  sensorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserSensorCreationAttributes extends Optional<UserSensorAttributes, 'id'> {}

class UserSensor extends Model<UserSensorAttributes, UserSensorCreationAttributes> implements UserSensorAttributes {
  public id!: string;
  public userId!: string;
  public sensorId!: string;
}

UserSensor.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sensorId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'user_sensors'
});

export default UserSensor;