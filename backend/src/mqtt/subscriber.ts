import mqtt, { MqttClient } from 'mqtt';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { Server } from 'socket.io';
import winston from 'winston';

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/mqtt-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/mqtt-combined.log' })
  ]
});

const influxClient = new InfluxDB({
  url: process.env.INFLUXDB_URL || 'http://localhost:8086',
  token: process.env.INFLUXDB_TOKEN || ''
});

const writeApi = influxClient.getWriteApi(
  process.env.INFLUXDB_ORG || 'sensor_org',
  process.env.INFLUXDB_BUCKET || 'sensor_bucket',
  'ns'
);

interface SensorData {
  sensor_id: string;
  timestamp: number;
  temperature: number;
  humidity: number;
}

const validateSensorData = (data: any): data is SensorData => {
  return (
    typeof data.sensor_id === 'string' &&
    typeof data.timestamp === 'number' &&
    typeof data.temperature === 'number' &&
    typeof data.humidity === 'number'
  );
};

export const connectMQTT = (io: Server): MqttClient => {
  const client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 5000,
    connectTimeout: 30000
  });

  client.on('connect', () => {
    logger.info('✅ MQTT Broker bağlantısı başarılı');
    client.subscribe('sensors/#', { qos: 1 }, (err) => {
      if (err) {
        logger.error('❌ MQTT subscribe hatası:', err);
      } else {
        logger.info('📡 sensors/# topic\'e subscribe olundu');
      }
    });
  });

  client.on('message', async (topic: string, message: Buffer) => {
    try {
      const rawData = JSON.parse(message.toString());

      if (!validateSensorData(rawData)) {
        logger.error('❌ Geçersiz sensör verisi:', { topic, data: rawData });
        return;
      }

      logger.info('📨 Yeni sensör verisi:', { topic, sensorId: rawData.sensor_id });

      const point = new Point('sensor_data')
        .tag('sensor_id', rawData.sensor_id)
        .tag('topic', topic)
        .floatField('temperature', rawData.temperature)
        .floatField('humidity', rawData.humidity)
        .timestamp(new Date(rawData.timestamp * 1000));

      writeApi.writePoint(point);
      await writeApi.flush();

      io.emit('sensor_data', {
        sensor_id: rawData.sensor_id,
        temperature: rawData.temperature,
        humidity: rawData.humidity,
        timestamp: rawData.timestamp,
        topic
      });

    } catch (error) {
      logger.error('❌ MQTT mesaj işleme hatası:', { topic, error });
    }
  });

  client.on('error', (error) => {
    logger.error('❌ MQTT bağlantı hatası:', error);
  });

  client.on('reconnect', () => {
    logger.warn('🔄 MQTT yeniden bağlanıyor...');
  });

  client.on('disconnect', () => {
    logger.warn('⚠️ MQTT bağlantısı kesildi');
  });

  return client;
};
