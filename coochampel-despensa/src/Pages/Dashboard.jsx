import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../../Atentication/AuthContext'
import Layout from '../componentes/Layout'

export default function Dashboard() {
  const { perfil } = useAuth()
  const [vencen, setVencen] = useState([])
  const [totalProductos, setTotalProductos] = useState(0)
  const [ventasHoy, setVentasHoy] = useState(0)

  useEffect(() => {
    const cargar = async () => {
      const hoy = new Date()
      const limite = new Date(hoy); limite.setDate(hoy.getDate() + 15)
      const hoyStr = hoy.toISOString().split('T')[0]
      const limStr = limite.toISOString().split('T')[0]

      // Productos próximos a vencer
      const { data: prods } = await supabase
        .from('productos')
        .select('nombre, fecha_caducidad')
        .lte('fecha_caducidad', limStr)
        .gte('fecha_caducidad', hoyStr)
        .eq('estado', 'activo')
      if (prods) setVencen(prods)

      // Total productos activos
      const { count } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo')
      setTotalProductos(count || 0)

      // Ventas del día
      const inicioDia = new Date(hoyStr).toISOString()
      const { data: ventas } = await supabase
        .from('ventas')
        .select('total')
        .gte('fecha_venta', inicioDia)
      
      const total = ventas?.reduce((sum, v) => sum + Number(v.total), 0) || 0
      setVentasHoy(total)
    }
    cargar()
  }, [])

  if (!perfil) return <div style={{padding:'2rem'}}>Cargando...</div>

  return (
    <Layout>
      <h1>Bienvenido, {perfil.nombre}</h1>
      <p style={{marginBottom:'1.5rem'}}>Rol: <strong>{perfil.rol === 'administrador' ? 'Administrador' : 'Vendedor'}</strong></p>

      {vencen.length > 0 && (
        <div className="alerta-vencimiento">
          ⚠️ Productos próximos a vencer (próximos 15 días):
          <ul>
            {vencen.map((p, i) => (
              <li key={i}>{p.nombre} — Vence: {new Date(p.fecha_caducidad).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>Productos Activos</h3>
          <div className="numero">{totalProductos}</div>
        </div>
        <div className="tarjeta">
          <h3>Ventas del Día</h3>
          <div className="numero">Q{ventasHoy.toFixed(2)}</div>
        </div>
      </div>
    </Layout>
  )
}
