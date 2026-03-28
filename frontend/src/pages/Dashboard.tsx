import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { useSocket } from '../hooks/useSocket';
import { getUser, logout } from '../services/auth';
import api from '../services/api';
import Users from './Users';
import Customers from './Customers';
import Toast from '../components/Toast';
import Analytics from './Analytics';

const colors = {
  bg: 'rgba(32, 30, 38, 1)',
  bgCard: 'rgba(42, 40, 50, 1)',
  bgHover: 'rgba(52, 50, 62, 1)',
  border: 'rgba(239, 239, 245, 0.08)',
  text: 'rgba(239, 239, 245, 1)',
  textMuted: 'rgba(239, 239, 245, 0.45)',
  textDim: 'rgba(239, 239, 245, 0.25)',
  red: 'rgba(227, 52, 67, 1)',
  redDim: 'rgba(227, 52, 67, 0.15)',
  green: 'rgba(34, 197, 94, 1)',
  greenDim: 'rgba(34, 197, 94, 0.12)',
  amber: 'rgba(251, 191, 36, 1)',
  cyan: 'rgba(6, 182, 212, 1)',
};

const StatCard = ({ title, value, unit, color, icon }: any) => (
  <div style={{
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minHeight: '120px',
    justifyContent: 'space-between'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: colors.textMuted, fontSize: '0.8125rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
      <span style={{ fontSize: '2.25rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: '1rem', color: colors.textMuted }}>{unit}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const { sensorData, connected } = useSocket();
  const [sensors, setSensors] = useState<any[]>([]);
const [logs, setLogs] = useState<any[]>([]);
const [activeTab, setActiveTab] = useState<'dashboard' | 'sensors' | 'users' | 'logs' | 'customers' | 'analytics'>('dashboard');
const [companies, setCompanies] = useState<any[]>([]);

const [showSensorModal, setShowSensorModal] = useState(false);
const [sensorError, setSensorError] = useState('');
const [newSensor, setNewSensor] = useState({ sensorId: '', name: '', type: 'temperature', companyId: '' });
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);




  const user = getUser();

  useEffect(() => {
  
    // System admin tüm sensörleri görür, diğer roller sadece atanmış sensörleri görür
    if (user?.role === 'system_admin') {
      api.get('/sensors').then(res => {
        console.log('All sensors fetched:', res.data);
        setSensors(res.data);
      }).catch(console.error);
    } else if (user?.role === 'company_admin' || user?.role === 'user') {
      console.log('Fetching sensors for user:', user.id);
      api.get('/sensors').then(res => setSensors(res.data)).catch(console.error);
    }
    
    api.get('/logs').then(res => setLogs(res.data)).catch(console.error);
    api.get('/companies').then(res => setCompanies(res.data)).catch(console.error);

    api.post('/logs', { action: 'viewed_logs', metadata: { page: 'dashboard' } }).catch(console.error);

    const handleToast = (event: CustomEvent) => {
      setToast(event.detail);
    };
    window.addEventListener('showToast', handleToast as EventListener);

    return () => {
      window.removeEventListener('showToast', handleToast as EventListener);
    };
  }, []);






const handleAddSensor = async (e: React.FormEvent) => {
  e.preventDefault();
  setSensorError('');
  try {
    await api.post('/sensors', newSensor);
    const res = await api.get('/sensors');
    setSensors(res.data);
    setShowSensorModal(false);
    setNewSensor({ sensorId: '', name: '', type: 'temperature', companyId: '' });
    setToast({ message: 'Sensör başarıyla eklendi', type: 'success' });
  } catch (err: any) {
    setSensorError(err.response?.data?.error || 'Hata oluştu.');
  }
};




  const chartData = sensorData.slice(0, 30).reverse().map(d => ({
    time: new Date(d.timestamp * 1000).toLocaleTimeString('tr-TR'),
    Sıcaklık: Number(d.temperature.toFixed(1)),
    Nem: Number(d.humidity.toFixed(1)),
    sensor: d.sensor_id
  }));

  const lastData = sensorData[0];

  return (
   <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: 'Inter, sans-serif', color: colors.text, margin: 0, padding: 0 }}>

      {/* Connection Status - Fixed Top Right */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: colors.bgCard,
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: connected ? colors.green : colors.red,
          boxShadow: connected ? `0 0 8px ${colors.green}` : 'none'
        }} />
        <span style={{ fontSize: '0.8125rem', color: connected ? colors.green : colors.red }}>
          {connected ? 'Canlı' : 'Bağlantı Yok'}
        </span>
      </div>

      {/* Sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px',
        background: colors.bgCard,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex', flexDirection: 'column',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px',
              background: colors.red,
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem'
            }}>P</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Patrion</div>
              <div style={{ fontSize: '0.6875rem', color: colors.textMuted }}>Sensör Sistemi</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'sensors', label: 'Sensörler', icon: '📡' },
            ...(user?.role === 'system_admin' || user?.role === 'company_admin' ? [
              { id: 'users', label: 'Kullanıcılar', icon: '👥' },
              ...(user?.role === 'system_admin' ? [
                { id: 'customers', label: 'Müşteriler', icon: '👤' }
              ] : []),
              { id: 'logs', label: 'Loglar', icon: '📋' },
              { id: 'analytics', label: 'Log Analitiği', icon: '🧠' },
            ] : [])
          ].filter(Boolean).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6875rem 0.875rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === item.id ? colors.redDim : 'transparent',
                color: activeTab === item.id ? colors.red : colors.textMuted,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === item.id ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.15s'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '1rem', borderTop: `1px solid ${colors.border}` }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{user?.role}</div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', padding: '0.5rem',
              background: colors.redDim,
              color: colors.red,
              border: `1px solid rgba(227, 52, 67, 0.2)`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500
            }}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: '220px', padding: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'users' && <Users />}
              {activeTab === 'customers' && <Customers />}
              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'sensors' && 'Sensörler'}
              {activeTab === 'logs' && 'Kullanıcı Logları'}
            </h1>
            <p style={{ color: colors.textMuted, fontSize: '0.875rem' }}>
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <StatCard title="Toplam Sensör" value={sensors.length} unit="adet" color={colors.red} icon="📡" />
              <StatCard title="Sıcaklık" value={lastData?.temperature?.toFixed(1) ?? '--'} unit="°C" color={colors.amber} icon="🌡️" />
              <StatCard title="Nem" value={lastData?.humidity?.toFixed(1) ?? '--'} unit="%" color={colors.cyan} icon="💧" />
              <StatCard title="Veri Sayısı" value={sensorData.length} unit="kayıt" color={colors.green} icon="📈" />
            </div>

            {/* Chart */}
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Gerçek Zamanlı Sensör Verisi</h2>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: colors.redDim,
                  color: colors.red,
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  CANLI
                </span>
              </div>
              {chartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: colors.textDim }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📡</div>
                  Sensör verisi bekleniyor...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgba(251, 191, 36, 0.3)" stopOpacity={1} />
                        <stop offset="95%" stopColor="rgba(251, 191, 36, 0)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgba(6, 182, 212, 0.3)" stopOpacity={1} />
                        <stop offset="95%" stopColor="rgba(6, 182, 212, 0)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,239,245,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: colors.textMuted, fontSize: 11 }} />
                    <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        color: colors.text
                      }}
                    />
                    <Legend wrapperStyle={{ color: colors.textMuted, fontSize: '0.8125rem' }} />
                    <Area type="monotone" dataKey="Sıcaklık" stroke={colors.amber} fill="url(#tempGrad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="Nem" stroke={colors.cyan} fill="url(#humGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

           
          </div>
        )}

        {/* Sensors Tab */}
       {/* Sensors Tab */}
{activeTab === 'sensors' && (
  <div>
    {/* Buton */}
    {(user?.role === 'system_admin' ) && (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowSensorModal(true)}
          style={{
            padding: '0.625rem 1.25rem',
            background: colors.red,
            border: 'none',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          + Sensör Ekle
        </button>
      </div>
    )}

    {/* Tablo */}
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
            {['Sensör ID', 'Ad', 'Tip', 'Şirket', 'Durum'].map(h => (
              <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', color: colors.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sensors.map(sensor => (
            <tr key={sensor.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
              <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', fontFamily: 'monospace', color: colors.textMuted }}>{sensor.sensorId}</td>
              <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>{sensor.name}</td>
              <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: colors.textMuted }}>{sensor.type}</td>
              <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: colors.textMuted }}>
                {sensor.companyId ? companies.find(c => c.id === sensor.companyId)?.name || '-' : '-'}
              </td>
              <td style={{ padding: '1rem 1.25rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                  background: sensor.isActive ? colors.greenDim : colors.redDim,
                  color: sensor.isActive ? colors.green : colors.red
                }}>
                  {sensor.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </td>
            </tr>
          ))}
          {sensors.length === 0 && (
            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: colors.textDim }}>Henüz sensör eklenmemiş.</td></tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Sensör Ekle Modal */}
    {showSensorModal && (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
      }}>
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Sensör Ekle</h3>
          {sensorError && (
            <div style={{ background: colors.redDim, color: colors.red, padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {sensorError}
            </div>
          )}
          <form onSubmit={handleAddSensor}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: colors.textMuted, fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Sensör ID</label>
              <input
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(239, 239, 245, 0.06)', border: '1px solid rgba(239, 239, 245, 0.12)', borderRadius: '8px', color: colors.text, fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' as const }}
                value={newSensor.sensorId}
                onChange={e => setNewSensor({ ...newSensor, sensorId: e.target.value })}
                placeholder="temp_sensor_01"
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: colors.textMuted, fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Ad</label>
              <input
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(239, 239, 245, 0.06)', border: '1px solid rgba(239, 239, 245, 0.12)', borderRadius: '8px', color: colors.text, fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' as const }}
                value={newSensor.name}
                onChange={e => setNewSensor({ ...newSensor, name: e.target.value })}
                placeholder="Sıcaklık Sensörü"
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: colors.textMuted, fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Tip</label>
              <select
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(239, 239, 245, 0.06)', border: '1px solid rgba(239, 239, 245, 0.12)', borderRadius: '8px', color: colors.text, fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' as const }}
                value={newSensor.type}
                onChange={e => setNewSensor({ ...newSensor, type: e.target.value })}
              >
                <option value="temperature">Sıcaklık</option>
                <option value="humidity">Nem</option>
                <option value="temperature_humidity">Sıcaklık + Nem</option>
                <option value="pressure">Basınç</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: colors.textMuted, fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Şirket</label>
              <select
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(239, 239, 245, 0.06)', border: '1px solid rgba(239, 239, 245, 0.12)', borderRadius: '8px', color: colors.text, fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' as const }}
                value={newSensor.companyId}
                onChange={e => setNewSensor({ ...newSensor, companyId: e.target.value })}
                required
              >
                <option value="">Şirket Seç</option>
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setShowSensorModal(false); setSensorError(''); }}
                style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, borderRadius: '8px', cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                type="submit"
                style={{ padding: '0.625rem 1.25rem', background: colors.red, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Ekle
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
)}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {['Kullanıcı', 'Aksiyon', 'Zaman', 'Detay'].map(h => (
                    <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', color: colors.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', fontFamily: 'monospace', color: colors.textMuted }}>{log.userId}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        padding: '0.375rem 0.875rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600,
                        background: colors.redDim, color: colors.red
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', color: colors.textMuted }}>
                      {new Date(log.timestamp).toLocaleString('tr-TR')}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{
                        background: 'rgba(239,239,245,0.04)',
                        border: '1px solid rgba(239,239,245,0.08)',
                        borderRadius: '6px',
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        color: colors.textMuted,
                        fontFamily: 'monospace',
                        maxWidth: '300px',
                        overflow: 'auto',
                        maxHeight: '100px'
                      }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: colors.textDim }}>Henüz log yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}