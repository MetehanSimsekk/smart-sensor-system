import api from './api';

class SensorSimulation {
  async simulateSensorData(sensorId: string, temperature: number, humidity: number) {
    const sensorData = {
      sensor_id: sensorId,
      timestamp: Math.floor(Date.now() / 1000),
      temperature,
      humidity
    };

    try {
      // Send to backend API which will publish to MQTT
      const response = await api.post('/sensors/simulate', {
        sensorId,
        temperature,
        humidity
      });

      console.log('✅ Sensor data sent via MQTT:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Sensor simulation error:', error);
      throw error;
    }
  }
}

export default new SensorSimulation();
