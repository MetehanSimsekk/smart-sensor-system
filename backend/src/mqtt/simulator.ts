import mqtt from 'mqtt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
  rejectUnauthorized: false
});

const sensors = [
  'temp_sensor_01',
  'temp_sensor_02',
  'temp_sensor_03'
];

client.on('connect', () => {
  console.log('🚀 Simülatör başladı, veri gönderiliyor...');

  setInterval(() => {
    sensors.forEach(sensorId => {
      const data = {
        sensor_id: sensorId,
        timestamp: Math.floor(Date.now() / 1000),
        temperature: +(20 + Math.random() * 15).toFixed(1),
        humidity: +(45 + Math.random() * 30).toFixed(1)
      };
      client.publish(`sensors/${sensorId}`, JSON.stringify(data));
      console.log(`📡 ${sensorId}: ${data.temperature}°C / ${data.humidity}%`);
    });
  }, 3000);
});

client.on('error', (err) => {
  console.error('❌ MQTT Hatası:', err);
});