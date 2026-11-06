import { useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import { useAuth } from '../../Atentication/AuthContext'
import Layout from '../componentes/Layout'

export default function Ingresos() {
  const { perfil } = useAuth()
  const esAdmin = perfil?.rol === 'administrador'
  const [productos, setProductos] = useState([])
  const [listaIngresos, setListaIngresos] = useState([])
  const [form, setForm] = useState({ id_producto: '', cantidad: '' })
  const [notificaciones, setNotificaciones] = useState(0)

  useEffect(() => {
    cargarProductos()
    if (esAdmin) cargarIngresos()
  }, [])

  const cargarProductos = async () => {
    const { data } = await supabase
      .from('productos')
      .select('id, nombre, codigo, stock')
      .eq('estado', 'activo')
    if (data) setProductos(data)
  }

  const cargarIngresos = async () => {
    const { data } = await supabase
      .from('ingresos')
      .select(`
        *,
        productos(nombre),
        perfiles(nombre)
      `)
      .order('fecha_ingreso', { ascending: false })
    if (data) setListaIngresos(data)
    
    const { count } = await supabase
      .from('ingresos')
      .select('*', { count: 'exact', head: true })
      .eq('notificado', false)
    setNotificaciones(count || 0)
  }

  const registrar = async (e) => {
    e.preventDefault()
    if (!form.id_producto || !form.cantidad) return
    const cant = Number(form.cantidad)

    // Registrar ingreso
    await supabase.from('ingresos').insert([{
      id_usuario: perfil.id,
      id_producto: Number(form.id_producto),
      cantidad: cant,
      notificado: esAdmin
    }])

    // Actualizar stock
    await supabase.rpc('actualizar_stock_ingreso', {
      pid: Number(form.id_producto),
      cantidad_nueva: cant
    })

    alert('✅ Ingreso registrado correctamente')
    setForm({ id_producto: '', cantidad: '' })
    cargarProductos()
    if (esAdmin) cargarIngresos()
    else alert('Se notificó al administrador')
  }

  const marcarNotificado = async (id) => {
    await supabase.from('ingresos').update({ notificado: true }).eq('id', id)
    cargarIngresos()
  }

  return (
    <Layout>
      <h1>Ingresos de Mercadería</h1>

      {!esAdmin && (
        <div className="notificacion">
          📋 Al registrar el ingreso, el administrador será notificado.
        </div>
      )}

      {esAdmin && notificaciones > 0 && (
        <div className="alerta-vencimiento">
          ⚠️ Hay {notificaciones} ingreso(s) pendientes de revisión.
        </div>
      )}

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <h3>Registrar Ingreso</h3>
        <form onSubmit={registrar}>
          <div className="grupo-form">
            <label>Producto</label>
            <select
              required
              value={form.id_producto}
              onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="">Seleccione un producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.codigo} — {p.nombre} (Stock actual: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="grupo-form">
            <label>Cantidad Ingresada</label>
            <input
              type="number"
              min="1"
              required
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="verde">Registrar Ingreso</button>
        </form>
      </div>

      {esAdmin && listaIngresos.length > 0 && (
        <>
          <h3>Historial de Ingresos</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Registrado por</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {listaIngresos.map(ing => (
                <tr key={ing.id}>
                  <td>{new Date(ing.fecha_ingreso).toLocaleString()}</td>
                  <td>{ing.productos?.nombre}</td>
                  <td>{ing.cantidad}</td>
                  <td>{ing.perfiles?.nombre}</td>
                  <td style={{ color: ing.notificado ? 'green' : 'orange', fontWeight: 'bold' }}>
                    {ing.notificado ? 'Revisado' : 'Pendiente'}
                  </td>
                  <td>
                    {!ing.notificado && (
                      <button onClick={() => marcarNotificado(ing.id)}>Marcar Revisado</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Layout>
  )
}
