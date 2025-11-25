// src/pages/LoginPage.tsx
import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getCurrentUser } from '@/services/auth';
import { extractColorFromCssVar } from '@/utils/ExtractColorFromCssVar';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, Input } from 'waddle-ui';
import './auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);   // ⬅️ usamos el store

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setCargando(true);
      await loginUser(email, password);
      const user = await getCurrentUser();
      setUser(user);
      navigate('/home', { replace: true });
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err?.message ?? 'Email o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  }

  const primaryColor = extractColorFromCssVar('--primary-color');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">📅</div>
          <h1>Calendario de Notas</h1>
          <h2>Iniciar Sesión</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            color={primaryColor}
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            color={primaryColor}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <Button color={primaryColor} type="submit" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
