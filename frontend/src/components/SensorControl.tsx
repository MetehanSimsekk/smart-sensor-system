import { useState, useEffect } from 'react';

interface SensorControlProps {
  sensor: any;
  onUpdate: (sensorId: string, temperature: number, humidity: number) => void;
  currentData?: { temperature: number; humidity: number; timestamp: number };
}

const colors = {
  bg: 'rgba(32, 30, 38, 1)',
  bgCard: 'rgba(42, 40, 50, 1)',
  bgHover: 'rgba(52, 50, 62, 1)',
  border: 'rgba(239, 239, 245, 0.08)',
  text: 'rgba(239, 239, 245, 1)',
  textMuted: 'rgba(239, 239, 245, 0.45)',
  red: 'rgba(227, 52, 67, 1)',
  redDim: 'rgba(227, 52, 67, 0.15)',
  green: 'rgba(34, 197, 94, 1)',
  greenDim: 'rgba(34, 197, 94, 0.12)',
  amber: 'rgba(251, 191, 36, 1)',
  cyan: 'rgba(6, 182, 212, 1)',
};

export default function SensorControl({ sensor, onUpdate, currentData }: SensorControlProps) {
  const [temperature, setTemperature] = useState(currentData?.temperature || 25.0);
  const [humidity, setHumidity] = useState(currentData?.humidity || 55.0);

  // Update values when currentData changes
  useEffect(() => {
    if (currentData) {
      setTemperature(currentData.temperature);
      setHumidity(currentData.humidity);
    }
  }, [currentData]);

  const handleTemperatureChange = (increase: boolean) => {
    const newTemp = increase ? Math.min(temperature + 0.5, 50) : Math.max(temperature - 0.5, -20);
    setTemperature(newTemp);
    onUpdate(sensor.sensorId, newTemp, humidity);
  };

  const handleHumidityChange = (increase: boolean) => {
    const newHumidity = increase ? Math.min(humidity + 1, 100) : Math.max(humidity - 1, 0);
    setHumidity(newHumidity);
    onUpdate(sensor.sensorId, temperature, newHumidity);
  };

  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{sensor.name}</h4>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: colors.textMuted, fontFamily: 'monospace' }}>
            {sensor.sensorId}
          </p>
        </div>
        <span style={{
          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
          background: sensor.isActive ? colors.greenDim : colors.redDim,
          color: sensor.isActive ? colors.green : colors.red
        }}>
          {sensor.isActive ? 'Aktif' : 'Pasif'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Temperature Control */}
        <div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🌡️ Sıcaklık
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => handleTemperatureChange(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                background: colors.bgHover,
                color: colors.text,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              -
            </button>
            <span style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              color: colors.amber,
              minWidth: '3rem',
              textAlign: 'center'
            }}>
              {temperature.toFixed(1)}°C
            </span>
            <button
              onClick={() => handleTemperatureChange(true)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                background: colors.bgHover,
                color: colors.text,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Humidity Control */}
        <div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💧 Nem
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => handleHumidityChange(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                background: colors.bgHover,
                color: colors.text,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              -
            </button>
            <span style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              color: colors.cyan,
              minWidth: '3rem',
              textAlign: 'center'
            }}>
              {humidity.toFixed(0)}%
            </span>
            <button
              onClick={() => handleHumidityChange(true)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                background: colors.bgHover,
                color: colors.text,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
