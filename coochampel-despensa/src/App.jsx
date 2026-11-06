import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../Atentication/AuthContext.jsx';
import Login from './Pages/Login.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import Inventario from './Pages/Inventario.jsx';
import Ventas from './Pages/Ventas.jsx';
import Ingresos from './Pages/Ingresos.jsx';
import Proveedores from './Pages/Proveedores.jsx';
import Reportes from './Pages/Reportes.jsx';
import Ganancias from './Pages/Ganancias.jsx';

function RutaProtegida({ children, soloAdmin }) {
  const { perfil, cargando } = useAuth();

  if (cargando) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem' }}>Cargando...</div>;
  }
  if (!perfil) {
    return <Navigate to="/" />;
  }
  if (soloAdmin && perfil.rol !== 'administrador') {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        } />

        <Route path="/inventario" element={
          <RutaProtegida>
            <Inventario />
          </RutaProtegida>
        } />

        <Route path="/ventas" element={
          <RutaProtegida>
            <Ventas />
          </RutaProtegida>
        } />

        <Route path="/ingresos" element={
          <RutaProtegida>
            <Ingresos />
          </RutaProtegida>
        } />

        <Route path="/proveedores" element={
          <RutaProtegida soloAdmin={true}>
            <Proveedores />
          </RutaProtegida>
        } />

        <Route path="/reportes" element={
          <RutaProtegida soloAdmin={true}>
            <Reportes />
          </RutaProtegida>
        } />

        <Route path="/ganancias" element={
          <RutaProtegida soloAdmin={true}>
            <Ganancias />
          </RutaProtegida>
        } />
      </Routes>
    </Router>
  );
}
