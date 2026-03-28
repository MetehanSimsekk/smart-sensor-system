import { useState, useEffect } from 'react';
import api from '../services/api';
import { getUser } from '../services/auth';
import Toast from '../components/Toast';

const colors = {
  bg: 'rgba(32, 30, 38, 1)',
  bgCard: 'rgba(42, 40, 50, 1)',
  border: 'rgba(239, 239, 245, 0.08)',
  text: 'rgba(239, 239, 245, 1)',
  textMuted: 'rgba(239, 239, 245, 0.45)',
  textDim: 'rgba(239, 239, 245, 0.25)',
  red: 'rgba(227, 52, 67, 1)',
  redDim: 'rgba(227, 52, 67, 0.15)',
  green: 'rgba(34, 197, 94, 1)',
  greenDim: 'rgba(34, 197, 94, 0.12)',
  cyan: 'rgba(6, 182, 212, 1)',
  cyanDim: 'rgba(6, 182, 212, 0.15)',
};

export default function Users() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [companySensors, setCompanySensors] = useState<any[]>([]);
  const [userSensors, setUserSensors] = useState<{ [key: string]: any[] }>({});
  const [showSensorAssign, setShowSensorAssign] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [companiesError, setCompaniesError] = useState<string>('');
  const currentUser = getUser();

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [newCompany, setNewCompany] = useState({ name: '', description: '' });

  useEffect(() => {
    console.log('Users component - currentUser:', currentUser);
    setCompaniesError('');
    api.get('/companies').then(res => {
      console.log('Companies fetched:', res.data);
      setCompanies(res.data);
      if (res.data.length > 0) {
     
        let defaultCompanyId = res.data[0].id;
        
      
        if (currentUser?.role === 'company_admin' && currentUser?.companyId) {
            const userCompany = res.data.find((c: any) => c.id === currentUser.companyId);
            if (userCompany) {
            defaultCompanyId = userCompany.id;
          }
        }
        
        setSelectedCompany(defaultCompanyId);
      }
    }).catch(err => {
      console.error('Companies fetch error:', err);
      setCompaniesError('Şirketler yüklenemedi. Lütfen tekrar giriş yapın.');
    });
  }, []);

  useEffect(() => {
    if (!selectedCompany) return;
    api.get(`/companies/${selectedCompany}/users`).then(res => setUsers(res.data)).catch(console.error);
    api.get('/sensors').then(res => setCompanySensors(res.data)).catch(console.error);
  }, [selectedCompany]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setToast({ message: 'Lütfen tüm zorunlu alanları doldurun.', type: 'error' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/companies/${selectedCompany}/users`, newUser);
      const res = await api.get(`/companies/${selectedCompany}/users`);
      setUsers(res.data);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowModal(false);
      setToast({ message: 'Kullanıcı başarıyla oluşturuldu.', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Kullanıcı eklenemedi.');
      setToast({ message: err.response?.data?.error || 'Kullanıcı oluşturulamadı.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/companies', newCompany);
      const res = await api.get('/companies');
      setCompanies(res.data);
      setShowCompanyModal(false);
      setNewCompany({ name: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setToast({ message: 'Kullanıcı başarıyla kaldırıldı.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Kullanıcı kaldırılamadı.', type: 'error' });
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await api.put(`/users/${userId}`, { role });
      const res = await api.get(`/companies/${selectedCompany}/users`);
      setUsers(res.data);
      setToast({ message: 'Kullanıcı rolü başarıyla güncellendi.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Rol güncellenemedi.', type: 'error' });
    }
  };

  const loadUserSensors = async (userId: string) => {
    try {
      const res = await api.get(`/companies/${selectedCompany}/users/${userId}/sensors`);
      setUserSensors(prev => ({ ...prev, [userId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSensor = async (userId: string, sensorId: string) => {
    try {
      await api.post(`/companies/${selectedCompany}/users/${userId}/sensors`, { userId, sensorId });
      await loadUserSensors(userId);
      const sensorName = companySensors.find(s => s.id === sensorId)?.name || 'Sensör';
      setToast({ message: `${sensorName} kullanıcıya atandı`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.response?.data?.error || 'Hata oluştu.', type: 'error' });
    }
  };

  const handleRemoveSensor = async (userId: string, sensorId: string) => {
    try {
      await api.delete(`/companies/${selectedCompany}/users/${userId}/sensors/${sensorId}`);
      await loadUserSensors(userId);
      const sensorName = userSensors[userId]?.find((s: any) => s.id === sensorId)?.name || 'Sensör';
      setToast({ message: `${sensorName} kullanıcıdan kaldırıldı`, type: 'success' });
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(239, 239, 245, 0.06)',
    border: '1px solid rgba(239, 239, 245, 0.12)',
    borderRadius: '8px',
    color: colors.text,
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block' as const,
    color: colors.textMuted,
    fontSize: '0.8125rem',
    fontWeight: 500,
    marginBottom: '0.5rem'
  };

  return (
    <div>
      {/* Şirket seçici + butonlar */}
      {companiesError && (
        <div style={{ 
          background: 'rgba(227, 52, 67, 0.15)', 
          color: 'rgba(227, 52, 67, 1)', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {companiesError}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {companies && companies.length > 0 && companies
            .filter(c => {
              if (currentUser?.role === 'system_admin') return true;
              if (currentUser?.role === 'company_admin') return true;
              return false;
            })
            .map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCompany(c.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${selectedCompany === c.id ? colors.red : colors.border}`,
                background: selectedCompany === c.id ? colors.redDim : 'transparent',
                color: selectedCompany === c.id ? colors.red : colors.textMuted,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: selectedCompany === c.id ? 600 : 400
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentUser?.role === 'system_admin' && (
            <button
              onClick={() => setShowCompanyModal(true)}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.textMuted,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              + Şirket Ekle
            </button>
          )}
          {selectedCompany && (
            <button
              onClick={() => setShowModal(true)}
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
              + Kullanıcı Ekle
            </button>
          )}
        </div>
      </div>

      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              { (currentUser?.role === 'system_admin' ? 
                ['Ad', 'Email', 'Rol', 'Durum', 'Rol Güncelle'] : 
                ['Ad', 'Email', 'Rol', 'Durum', 'İşlem']
              ).map(h => (
                <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', color: colors.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <>
                <tr key={user.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>{user.name}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: colors.textMuted }}>{user.email}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                      background: user.role === 'company_admin' ? 'rgba(99,102,241,0.15)' : colors.redDim,
                      color: user.role === 'company_admin' ? 'rgba(129,140,248,1)' : colors.red
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                      background: user.isActive ? colors.greenDim : colors.redDim,
                      color: user.isActive ? colors.green : colors.red
                    }}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {currentUser?.role === 'system_admin' && (
                        <select
                          value={user.role}
                          onChange={e => handleUpdateRole(user.id, e.target.value)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: 'rgba(99,102,241,0.15)',
                            color: 'rgba(129,140,248,1)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8125rem'
                          }}
                        >
                          <option value="user">User</option>
                          <option value="company_admin">Company Admin</option>
                        </select>
                      )}
                      <button
                        onClick={() => {
                          if (showSensorAssign === user.id) {
                            setShowSensorAssign(null);
                          } else {
                            setShowSensorAssign(user.id);
                            loadUserSensors(user.id);
                          }
                        }}
                        style={{
                          padding: '0.375rem 0.875rem',
                          background: colors.cyanDim,
                          color: colors.cyan,
                          border: '1px solid rgba(6,182,212,0.2)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem'
                        }}
                      >
                        📡 Sensörler
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{
                          padding: '0.375rem 0.875rem',
                          background: colors.redDim,
                          color: colors.red,
                          border: `1px solid rgba(227, 52, 67, 0.2)`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem'
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
                {showSensorAssign === user.id && (
                  <tr key={`${user.id}-sensors`}>
                    <td colSpan={currentUser?.role === 'system_admin' ? 6 : 5} style={{ padding: '1rem 1.25rem', background: 'rgba(239,239,245,0.02)', borderBottom: `1px solid ${colors.border}` }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', color: colors.textMuted }}>Atanmış sensörler:</span>
                        {(userSensors[user.id] || []).length === 0 && (
                          <span style={{ fontSize: '0.8125rem', color: colors.textDim }}>Henüz sensör atanmamış</span>
                        )}
                        {(userSensors[user.id] || []).map((s: any) => (
                          <span key={s.id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                            padding: '0.25rem 0.75rem',
                            background: colors.cyanDim,
                            color: colors.cyan,
                            borderRadius: '999px',
                            fontSize: '0.75rem'
                          }}>
                            {s.name}
                            <button
                              onClick={() => handleRemoveSensor(user.id, s.id)}
                              style={{ background: 'none', border: 'none', color: colors.cyan, cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        <select
                          onChange={e => { if (e.target.value) { handleAssignSensor(user.id, e.target.value); e.target.value = ''; } }}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(239,239,245,0.06)',
                            border: '1px solid rgba(239,239,245,0.12)',
                            borderRadius: '6px',
                            color: colors.text,
                            fontSize: '0.8125rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">+ Sensör Ekle</option>
                          {companySensors
                            .filter(s => !(userSensors[user.id] || []).find((us: any) => us.id === s.id))
                            .map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))
                          }
                        </select>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={currentUser?.role === 'system_admin' ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', color: colors.textDim }}>Bu şirkette henüz kullanıcı yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Kullanıcı Ekle</h3>
            {error && <div style={{ background: colors.redDim, color: colors.red, padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Ad Soyad</label>
                <input style={inputStyle} value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" style={inputStyle} value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Şifre</label>
                <input type="password" style={inputStyle} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
              </div>
              {(currentUser?.role === 'system_admin' || currentUser?.role === 'company_admin') && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Rol</label>
                  <select style={inputStyle} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">User</option>
                    {currentUser?.role === 'system_admin' && <option value="company_admin">Company Admin</option>}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, borderRadius: '8px', cursor: 'pointer' }}>İptal</button>
                <button type="submit" disabled={loading} style={{ padding: '0.625rem 1.25rem', background: colors.red, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Ekleniyor...' : 'Ekle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompanyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Şirket Ekle</h3>
            {error && <div style={{ background: colors.redDim, color: colors.red, padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <form onSubmit={handleAddCompany}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Şirket Adı</label>
                <input style={inputStyle} value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Açıklama</label>
                <input style={inputStyle} value={newCompany.description} onChange={e => setNewCompany({ ...newCompany, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCompanyModal(false)} style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, borderRadius: '8px', cursor: 'pointer' }}>İptal</button>
                <button type="submit" disabled={loading} style={{ padding: '0.625rem 1.25rem', background: colors.red, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Ekleniyor...' : 'Ekle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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