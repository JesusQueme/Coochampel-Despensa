import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../Atentication/AuthContext'

export default function Layout({ children }) {
  const { perfil, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const esAdmin = perfil?.rol === 'administrador'

  return (
    <div>
      <aside className="barra-lateral">
        <div className="logo">
          <h3>Coochampel R.L.</h3>
          <p style={{fontSize: '0.8rem', opacity: 0.8}}>Unidos en la Diversidad</p>
        </div>
        <nav>
          <Link to="/dashboard" className={ubicacion.pathname === '/dashboard' ? 'activo' : ''}>Inicio</Link>
          <Link to="/inventario" className={ubicacion.pathname === '/inventario' ? 'activo' : ''}>Inventario</Link>
          <Link to="/ventas" className={ubicacion.pathname === '/ventas' ? 'activo' : ''}>Punto de Venta</Link>
          
          {esAdmin && (
            <>
              <Link to="/ingresos" className={ubicacion.pathname === '/ingresos' ? 'activo' : ''}>Ingresos de Mercadería</Link>
              <Link to="/proveedores" className={ubicacion.pathname === '/proveedores' ? 'activo' : ''}>Proveedores</Link>
              <Link to="/reportes" className={ubicacion.pathname === '/reportes' ? 'activo' : ''}>Reportes</Link>
              <Link to="/ganancias" className={ubicacion.pathname === '/ganancias' ? 'activo' : ''}>Ganancias</Link>
            </>
          )}
          
          <button onClick={() => { cerrarSesion(); navegar('/') }} style={{marginTop: '2rem'}}>Cerrar Sesión</button>
        </nav>
      </aside>
      <main className="contenido">{children}</main>
    </div>
  )
}
