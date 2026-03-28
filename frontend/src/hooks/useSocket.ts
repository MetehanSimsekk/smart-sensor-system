import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SensorData {
  sensor_id: string;
  temperature: number;
  humidity: number;
  timestamp: number;
  topic: string;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('token') }
    });

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.on('sensor_data', (data: SensorData) => {
      setSensorData(prev => [data, ...prev].slice(0, 100));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return { sensorData, connected };
};