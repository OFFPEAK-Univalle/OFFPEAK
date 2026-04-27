import React, { useState } from 'react';
import { Activity } from 'lucide-react'; // Importamos el ícono para el banner
import AuthForm from '../components/AuthForm';
import '../styles/Auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'autoridad'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleTabChange = (loginState) => {
    setIsLogin(loginState);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);

        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params
        });

        if (!response.ok) {
          throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);

        window.location.href = '/dashboard';
      } else {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Error al registrar el usuario.');
        }

        setIsLogin(true);
        setError('Registro exitoso. Ahora puedes iniciar sesión.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">

      {/* LADO IZQUIERDO: Banner Informativo */}
      <div className="auth-banner">
        <div className="banner-decoration"></div>

        <div className="banner-content">
          <Activity size={48} className="banner-icon" />
          <h1 className="banner-title">Hola,<br />OffPeak! 👋</h1>
          <p className="banner-description">
            Plataforma central para el monitoreo de afluencia peatonal y gestión de movilidad en Santiago de Cali. Optimiza tiempos, prevén congestiones y emite alertas en tiempo real.
          </p>
        </div>

        <div className="banner-footer">
          &copy; 2026 OffPeak Admin. Todos los derechos reservados.
        </div>
      </div>

      {/* LADO DERECHO: Formulario */}
      <div className="auth-form-side">
        <AuthForm
          isLogin={isLogin}
          setIsLogin={handleTabChange}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>

    </div>
  );
}