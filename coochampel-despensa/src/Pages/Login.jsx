import { useState } from 'react'
import { useAuth } from '../../Atentication/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState('')
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await iniciarSesion(correo, contraseña)
    if (error) setError('Credenciales incorrectas')
    else navegar('/dashboard')
  }

  return (
    <div className="login-pagina">
      <div className="login-tarjeta">
        <div className="logo">
          <h1>Coochampel R.L.</h1>
          <p>Unidos en la Diversidad</p>
        </div>
        <h2>Iniciar Sesión</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={manejarEnvio}>
          <div className="grupo">
            <label>Correo</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </div>
          <div className="grupo">
            <label>Contraseña</label>
            <input type="password" value={contraseña} onChange={(e) => setContraseña(e.target.value)} required />
          </div>
          <button type="submit">Entrar al Sistema</button>
        </form>
      </div>
      <style>{`
        .login-pagina {
          background: var(--fondo);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', sans-serif;
        }
        .login-tarjeta {
          background: white;
          padding: 2.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
        }
        .logo { text-align: center; margin-bottom: 1.5rem; }
        .logo h1 { color: var(--azul-oscuro); font-size: 1.5rem; }
        .logo p { color: var(--verde); font-style: italic; }
        h2 { text-align: center; color: var(--azul-oscuro); margin-bottom: 1.5rem; }
        .grupo { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; color: var(--texto-oscuro); }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--azul-claro);
          border-radius: 0.5rem;
          font-size: 1rem;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background: var(--azul-oscuro);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover { background: #008888; }
        .error {
          background: #ffe6e6;
          color: #cc0000;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
