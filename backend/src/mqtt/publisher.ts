import mqtt, { MqttClient } from 'mqtt';
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
    new winston.transports.File({ filename: 'logs/mqtt-publisher.log' })
  ]
});

interface SensorData {
  sensor_id: string;
  timestamp: number;
  temperature: number;
  humidity: number;
}

class MQTTPublisher {
  private client: MqttClient | null = null;

  constructor() {
    this.connect();
  }

  private connect(): void {
    const tlsOptions = process.env.MQTT_BROKER_URL?.startsWith('mqtts') ? {
      ca: require('fs').readFileSync(process.env.MQTT_CA_CERT || '/mosquitto/certs/ca.crt')
    } : {};

    this.client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      ...tlsOptions
    });

    this.client.on('connect', () => {
      logger.info('✅ MQTT Publisher bağlantısı başarılı');
    });

    this.client.on('error', (error) => {
      logger.error('❌ MQTT Publisher bağlantı hatası:', error);
    });

    this.client.on('reconnect', () => {
      logger.warn('🔄 MQTT Publisher yeniden bağlanıyor...');
    });

    this.client.on('disconnect', () => {
      logger.warn('⚠️ MQTT Publisher bağlantısı kesildi');
    });
  }

  async publishSensorData(sensorData: SensorData): Promise<void> {
    if (!this.client || !this.client.connected) {
      logger.error('❌ MQTT Publisher bağlantısı yok');
      throw new Error('MQTT bağlantısı kurulamadı');
    }

    const topic = `sensors/${sensorData.sensor_id}`;
    const message = JSON.stringify(sensorData);

    try {
      await new Promise<void>((resolve, reject) => {
        this.client!.publish(topic, message, { qos: 1 }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      logger.info(`📤 Sensör verisi gönderildi: ${topic}`, sensorData);
    } catch (error) {
      logger.error(`❌ Sensör verisi gönderilemedi: ${topic}`, error);
      throw error;
    }
  }

  async publishSensorDataFromControls(sensorId: string, temperature: number, humidity: number): Promise<SensorData> {
    const sensorData: SensorData = {
      sensor_id: sensorId,
      timestamp: Math.floor(Date.now() / 1000),
      temperature,
      humidity
    };

    await this.publishSensorData(sensorData);
    return sensorData;
  }
}

export default new MQTTPublisher();
