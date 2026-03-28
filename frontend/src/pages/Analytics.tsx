import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const colors = {
  bgCard: 'rgba(42, 40, 50, 1)',
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
  purple: 'rgba(139, 92, 246, 1)',
  purpleDim: 'rgba(139, 92, 246, 0.15)',
};

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/logs/analytics')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: colors.textDim }}>
      Analiz yükleniyor...
    </div>
  );

  const hourlyData = Object.entries(data.hourlyDistribution).map(([hour, count]) => ({
    hour: `${hour}:00`,
    istek: count
  }));

  const dailyData = Object.entries(data.dailyDistribution)
    .slice(-7)
    .map(([day, count]) => ({ day: day.slice(5), istek: count }));

  const predictionData = data.prediction.map((p: any) => ({
    hour: `${p.hour}:00`,
    tahmin: p.predicted
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(500px, 1fr))', gap: '2rem' }}>


      {/* Anomali Alert */}
      <div style={{
        gridColumn: '1 / -1',
        padding: '1.25rem 1.5rem',
        background: data.anomaly.detected ? colors.redDim : colors.greenDim,
        border: `1px solid ${data.anomaly.detected ? 'rgba(227,52,67,0.3)' : 'rgba(34,197,94,0.3)'}`,
        borderRadius: '12px',
        color: data.anomaly.detected ? colors.red : colors.green,
        fontSize: '0.9375rem',
        fontWeight: 500
      }}>
        {data.anomaly.message}
      </div>

      {/* Özet kartlar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem',
        gridColumn: '1 / -1'
      }}>
        {[
          { title: 'Toplam İstek', value: data.total, color: colors.cyan },
          { title: 'Bugün', value: data.anomaly.todayCount, color: colors.amber },
          { title: 'Günlük Ortalama', value: data.anomaly.average, color: colors.purple },
        ].map(card => (
          <div key={card.title} style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <p style={{ color: colors.textMuted, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{card.title}</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Saatlik yoğunluk */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem' }}>Saatlik Aktivite Dağılımı</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,239,245,0.05)" />
            <XAxis dataKey="hour" tick={{ fill: colors.textMuted, fontSize: 10 }} />
            <YAxis tick={{ fill: colors.textMuted, fontSize: 10 }} />
            <Tooltip contentStyle={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text }} />
            <Bar dataKey="istek" fill="rgba(227, 52, 67, 0.7)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Günlük trend */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem' }}>Son 7 Günlük Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(139,92,246,0.3)" />
                <stop offset="95%" stopColor="rgba(139,92,246,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,239,245,0.05)" />
            <XAxis dataKey="day" tick={{ fill: colors.textMuted, fontSize: 11 }} />
            <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} />
            <Tooltip contentStyle={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text }} />
            <Area type="monotone" dataKey="istek" stroke={colors.purple} fill="url(#dailyGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 24 saatlik tahmin */}
      <div style={{ 
        gridColumn: '1 / -1',
        background: colors.bgCard, 
        border: `1px solid ${colors.border}`, 
        borderRadius: '16px', 
        padding: '1.5rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>24 Saatlik Tahmin</h3>
          <span style={{ fontSize: '0.75rem', color: colors.textMuted, background: colors.purpleDim, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
            Moving Average
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={predictionData}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(251,191,36,0.3)" />
                <stop offset="95%" stopColor="rgba(251,191,36,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,239,245,0.05)" />
            <XAxis dataKey="hour" tick={{ fill: colors.textMuted, fontSize: 10 }} />
            <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} />
            <Tooltip contentStyle={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text }} />
            <Area type="monotone" dataKey="tahmin" stroke={colors.amber} fill="url(#predGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* En aktif kullanıcılar */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem' }}>En Aktif Kullanıcılar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.topUsers.map((u: any, i: number) => (
            <div key={u.userId} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1rem',
              background: 'rgba(239,239,245,0.03)',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: i === 0 ? colors.amber : i === 1 ? colors.textMuted : colors.textDim,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: 'rgba(32,30,38,1)'
                }}>{i + 1}</span>
                <span style={{ fontSize: '0.8125rem', color: colors.textMuted }}>{u.userName}</span>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.cyan }}>{u.count} istek</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}