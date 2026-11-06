import { useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import Layout from '../componentes/Layout'

export default function Ganancias() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [detalles, setDetalles] = useState([])
  const [totalGanancia, setTotalGanancia] = useState(0)

  useEffect(() => {
    cargarDatos()
  }, [fecha])

  const cargarDatos = async () => {
    const inicio = new Date(fecha).toISOString()
    const fin = new Date(new Date(fecha).setHours(23, 59, 59)).toISOString()

    const { data, error } = await supabase
      .from('detalle_venta')
      .select(`
        *,
        productos(nombre, precio_compra),
        ventas(fecha_venta)
      `)
      .gte('ventas.fecha_venta', inicio)
      .lte('ventas.fecha_venta', fin)

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setDetalles(data)
      setTotalGanancia(data.reduce((s, d) => s + Number(d.ganancia), 0))
    }
  }

  return (
    <Layout>
      <h1>Ganancias por Producto</h1>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 'bold' }}>
          Seleccionar fecha:
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
      </div>

      <div className="tarjetas" style={{ marginBottom: '1.5rem' }}>
        <div className="tarjeta">
          <h3>Ganancia Total del Día</h3>
          <div className="numero" style={{ color: '#0066cc' }}>Q{totalGanancia.toFixed(2)}</div>
        </div>
        <div className="tarjeta">
          <h3>Productos Vendidos</h3>
          <div className="numero">{detalles.length}</div>
        </div>
      </div>

      {detalles.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Ganancia Unitaria</th>
              <th>Ganancia Total</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((d, i) => {
              const gananciaUnit = d.precio_unitario - Number(d.productos?.precio_compra || 0)
              return (
                <tr key={i}>
                  <td>{d.productos?.nombre || '—'}</td>
                  <td>{d.cantidad}</td>
                  <td>Q{Number(d.productos?.precio_compra || 0).toFixed(2)}</td>
                  <td>Q{Number(d.precio_unitario).toFixed(2)}</td>
                  <td style={{ color: 'green' }}>Q{gananciaUnit.toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold', color: 'green' }}>Q{Number(d.ganancia).toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No hay ventas registradas en esta fecha.
        </p>
      )}
    </Layout>
  )
}
