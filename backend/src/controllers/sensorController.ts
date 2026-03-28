import { Response } from 'express';
import { InfluxDB } from '@influxdata/influxdb-client';
import Sensor from '../models/Sensor';
import UserSensor from '../models/UserSensor';
import { AuthRequest } from '../middlewares/auth';
import { UserRole } from '../models/User';

const influxClient = new InfluxDB({
  url: process.env.INFLUXDB_URL || 'http://localhost:8086',
  token: process.env.INFLUXDB_TOKEN || ''
});

const queryApi = influxClient.getQueryApi(process.env.INFLUXDB_ORG || 'sensor_org');

export const getSensors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role === UserRole.SYSTEM_ADMIN) {
      const sensors = await Sensor.findAll({ where: { isActive: true } });
      res.json(sensors);
      return;
    }

    const userSensors = await UserSensor.findAll({ where: { userId: req.user?.id } });
    const sensorIds = userSensors.map(us => us.sensorId);

    if (sensorIds.length === 0) {
      res.json([]);
      return;
    }

    const sensors = await Sensor.findAll({ where: { id: sensorIds, isActive: true } });
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const createSensor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sensorId, name, type, companyId } = req.body;
    const existing = await Sensor.findOne({ where: { sensorId } });
    if (existing) {
      res.status(400).json({ error: 'Bu sensör ID zaten kayıtlı.' });
      return;
    }
    const sensor = await Sensor.create({ sensorId, name, type, companyId });
    res.status(201).json(sensor);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const getSensorData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { range = '1h' } = req.query;

    const fluxQuery = `
      from(bucket: "${process.env.INFLUXDB_BUCKET}")
        |> range(start: -${range})
        |> filter(fn: (r) => r._measurement == "sensor_data")
        |> filter(fn: (r) => r.sensor_id == "${sensorId}")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 100)
    `;

    const data: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) { data.push(tableMeta.toObject(row)); },
        error(error) { reject(error); },
        complete() { resolve(); }
      });
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const deleteSensor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Sensor.update({ isActive: false }, { where: { id } });
    res.json({ message: 'Sensör silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const getUserSensors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (req.user?.role === UserRole.USER && req.user.id !== userId) {
      res.status(403).json({ error: 'Yetkisiz erişim.' });
      return;
    }
    const userSensors = await UserSensor.findAll({ where: { userId } });
    const sensorIds = userSensors.map(us => us.sensorId);
    const sensors = await Sensor.findAll({ where: { id: sensorIds, isActive: true } });
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};