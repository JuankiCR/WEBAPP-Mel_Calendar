// src/pages/RegisterPage.tsx
import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '@/services/auth';
import { extractColorFromCssVar } from '@/utils/ExtractColorFromCssVar';
import { Button, Input } from 'waddle-ui';
import './auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setCargando(true);
      await registerUser(nombre, email, password);
      // Después de registrarse, lo mando al login
      navigate('/login');
    } catch (err: any) {
      setError(err?.message ?? 'Error al registrar');
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
          <h2>Crear Cuenta</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            color={primaryColor}
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
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
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <Input
            color={primaryColor}
            type="password"
            placeholder="Confirmar contraseña"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            minLength={6}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <Button color={primaryColor} type="submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
