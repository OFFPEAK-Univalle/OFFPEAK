import React from 'react';
import { Mail, Lock, User, Shield, ArrowRight, AlertCircle } from 'lucide-react';

export default function AuthForm({
    isLogin, setIsLogin, formData, handleChange, handleSubmit, loading, error
}) {
    return (
        <div className="auth-card">

            <div className="auth-header">
                <h2 className="auth-title">
                    {isLogin ? 'Bienvenido de vuelta' : 'Crear nueva cuenta'}
                </h2>
                <p className="auth-subtitle">
                    {isLogin
                        ? 'Ingresa tus credenciales para acceder al panel de control.'
                        : 'Registra tus datos como autoridad de movilidad.'}
                </p>
            </div>

            <div className="auth-tabs">
                <button type="button" onClick={() => setIsLogin(true)} className={`auth-tab-btn ${isLogin ? 'active' : 'inactive'}`}>
                    INICIAR SESIÓN
                </button>
                <button type="button" onClick={() => setIsLogin(false)} className={`auth-tab-btn ${!isLogin ? 'active' : 'inactive'}`}>
                    REGISTRARSE
                </button>
            </div>

            {error && (
                <div className={`auth-alert ${error.includes('exitoso') ? 'success' : 'error'}`}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                    <div className="form-group">
                        <label className="form-label">NOMBRE COMPLETO</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required={!isLogin}
                                placeholder="Ej. Oficial Juan Pérez"
                                className="auth-input"
                            />
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">CORREO ELECTRÓNICO</label>
                    <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="correo@cali.gov.co"
                            className="auth-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">CONTRASEÑA</label>
                    <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="auth-input"
                        />
                    </div>
                </div>

                {!isLogin && (
                    <div className="form-group">
                        <label className="form-label">ROL ASIGNADO</label>
                        <div className="role-display">
                            <Shield size={18} color="var(--accent-cyan)" />
                            <span className="role-text">Autoridad de Movilidad</span>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'PROCESANDO...' : (isLogin ? 'ACCEDER AL PANEL' : 'COMPLETAR REGISTRO')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>
        </div>
    );
}