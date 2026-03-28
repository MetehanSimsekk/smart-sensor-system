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

export default function Customers() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const currentUser = getUser();

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    taxOffice: '',
    companyId: ''
  });

  useEffect(() => {
    // Sadece system_admin müşterileri görebilir
    if (currentUser?.role === 'system_admin') {
      api.get('/companies').then(res => {
        setCompanies(res.data);
      }).catch(console.error);

      api.get('/customers').then(res => {
        setCustomers(res.data);
      }).catch(console.error);
    }
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/customers', newCustomer);
      const res = await api.get('/customers');
      setCustomers(res.data);
      setShowModal(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxNumber: '',
        taxOffice: '',
        companyId: ''
      });
      setToast({ message: 'Müşteri başarıyla oluşturuldu', type: 'success' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/customers/${customerId}`);
      setCustomers(customers.filter(c => c.id !== customerId));
      setToast({ message: 'Müşteri silindi', type: 'success' });
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

  if (currentUser?.role !== 'system_admin') {
    return (
      <div style={{ 
        padding: '3rem', 
        textAlign: 'center', 
        color: colors.textDim,
        fontSize: '1.125rem'
      }}>
        Bu sayfaya erişim yetkiniz bulunmamaktadır.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Müşteri Yönetimi</h2>
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
          + Müşteri Ekle
        </button>
      </div>

      {/* Müşteri Tablosu */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              {['Ad', 'Email', 'Telefon', 'Vergi No', 'Şirket', 'Durum', 'İşlem'].map(h => (
                <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', color: colors.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>{customer.name}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: colors.textMuted }}>{customer.email}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: colors.textMuted }}>{customer.phone || '-'}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: colors.textMuted }}>{customer.taxNumber || '-'}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: colors.textMuted }}>
                  {customer.company?.name || '-'}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                    background: customer.isActive ? colors.greenDim : colors.redDim,
                    color: customer.isActive ? colors.green : colors.red
                  }}>
                    {customer.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
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
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: colors.textDim }}>Henüz müşteri eklenmemiş.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Müşteri Ekle Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Müşteri Ekle</h3>
            {error && <div style={{ background: colors.redDim, color: colors.red, padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <form onSubmit={handleAddCustomer}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Ad Soyad</label>
                  <input style={inputStyle} value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" style={inputStyle} value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Telefon</label>
                  <input style={inputStyle} value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Vergi No</label>
                  <input style={inputStyle} value={newCustomer.taxNumber} onChange={e => setNewCustomer({ ...newCustomer, taxNumber: e.target.value })} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Vergi Dairesi</label>
                  <input style={inputStyle} value={newCustomer.taxOffice} onChange={e => setNewCustomer({ ...newCustomer, taxOffice: e.target.value })} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Şirket</label>
                  <select style={inputStyle} value={newCustomer.companyId} onChange={e => setNewCustomer({ ...newCustomer, companyId: e.target.value })} required>
                    <option value="">Şirket Seç</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Adres</label>
                <textarea style={inputStyle} value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} rows={3} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, borderRadius: '8px', cursor: 'pointer' }}>İptal</button>
                <button type="submit" disabled={loading} style={{ padding: '0.625rem 1.25rem', background: colors.red, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Ekleniyor...' : 'Ekle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
