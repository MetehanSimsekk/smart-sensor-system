import { useState } from 'react';
import { login } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgba(32, 30, 38, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '0 1.5rem'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img
            src="/patrion-logo2.png"
            alt="Patrion"
            style={{ height: '150px', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div style={{
            marginTop: '0.75rem',
            fontSize: '0.875rem',
            color: 'rgba(239, 239, 245, 0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Akıllı Sensör Takip Sistemi
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(239, 239, 245, 0.04)',
          border: '1px solid rgba(239, 239, 245, 0.08)',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <h2 style={{
            color: 'rgba(239, 239, 245, 1)',
            fontSize: '1.375rem',
            fontWeight: 600,
            marginBottom: '0.375rem'
          }}>
            Hoş Geldiniz
          </h2>
          <p style={{
            color: 'rgba(239, 239, 245, 0.45)',
            fontSize: '0.875rem',
            marginBottom: '1.75rem'
          }}>
            Devam etmek için giriş yapın
          </p>

          {error && (
            <div style={{
              background: 'rgba(227, 52, 67, 0.12)',
              border: '1px solid rgba(227, 52, 67, 0.3)',
              color: 'rgba(227, 52, 67, 1)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(239, 239, 245, 0.7)',
                fontSize: '0.875rem',
                fontWeight: 500,
                marginBottom: '0.5rem'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ornek@patrion.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 239, 245, 0.06)',
                  border: '1px solid rgba(239, 239, 245, 0.12)',
                  borderRadius: '8px',
                  color: 'rgba(239, 239, 245, 1)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(227, 52, 67, 0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(239, 239, 245, 0.12)'}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(239, 239, 245, 0.7)',
                fontSize: '0.875rem',
                fontWeight: 500,
                marginBottom: '0.5rem'
              }}>
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 239, 245, 0.06)',
                  border: '1px solid rgba(239, 239, 245, 0.12)',
                  borderRadius: '8px',
                  color: 'rgba(239, 239, 245, 1)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(227, 52, 67, 0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(239, 239, 245, 0.12)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8125rem',
                background: loading
                  ? 'rgba(227, 52, 67, 0.5)'
                  : 'rgba(227, 52, 67, 1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                letterSpacing: '0.02em'
              }}
              onMouseEnter={e => {
                if (!loading) (e.target as HTMLButtonElement).style.background = 'rgba(207, 32, 47, 1)';
              }}
              onMouseLeave={e => {
                if (!loading) (e.target as HTMLButtonElement).style.background = 'rgba(227, 52, 67, 1)';
              }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: 'rgba(239, 239, 245, 0.25)',
          fontSize: '0.75rem'
        }}>
          © 2026 Patrion. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}