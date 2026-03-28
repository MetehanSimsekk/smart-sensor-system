import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserLogAttributes {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  metadata: object | null;
}

interface UserLogCreationAttributes extends Optional<UserLogAttributes, 'id' | 'metadata'> {}

class UserLog extends Model<UserLogAttributes, UserLogCreationAttributes> implements UserLogAttributes {
  public id!: string;
  public userId!: string;
  public action!: string;
  public timestamp!: Date;
  public metadata!: object | null;
}

UserLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'user_logs'
});

export default UserLog;