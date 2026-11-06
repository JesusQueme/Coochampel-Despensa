import { useState } from 'react'
import { supabase } from '../../supabase/supabase'
import Layout from '../componentes/Layout'

export default function Reportes() {
  const [tipo, setTipo] = useState('semana')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [datos, setDatos] = useState([])
  const [totalGeneral, setTotalGeneral] = useState(0)

  const generar = async () => {
    let inicio, fin
    const hoy = new Date()

    if (tipo === 'semana') {
      inicio = new Date(hoy); inicio.setDate(hoy.getDate() - hoy.getDay())
      fin = new Date(inicio); fin.setDate(fin.getDate() + 6)
    } else if (tipo === 'mes') {
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
    } else if (tipo === 'anio') {
      inicio = new Date(hoy.getFullYear(), 0, 1)
      fin = new Date(hoy.getFullYear(), 11, 31)
    } else if (tipo === 'personalizado' && fechaInicio && fechaFin) {
      inicio = new Date(fechaInicio)
      fin = new Date(fechaFin)
    } else {
      return alert('Seleccione el período')
    }

    const { data } = await supabase
      .from('ventas')
      .select(`
        id, fecha_venta, total,
        perfiles(nombre)
      `)
      .gte('fecha_venta', inicio.toISOString())
      .lte('fecha_venta', new Date(fin.setHours(23,59,59)).toISOString())
      .order('fecha_venta', { ascending: false })

    setDatos(data || [])
    setTotalGeneral(data?.reduce((s, v) => s + Number(v.total), 0) || 0)
  }

  return (
    <Layout>
      <h1>Reportes de Ventas</h1>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <h3>Filtrar por Período</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <label>
            Tipo:
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ marginLeft: '0.5rem' }}>
              <option value="semana">Semana Actual</option>
              <option value="mes">Mes Actual</option>
              <option value="anio">Año Actual</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </label>
          {tipo === 'personalizado' && (
            <>
              <label>Del: <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} /></label>
              <label>Al: <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} /></label>
            </>
          )}
          <button className="verde" onClick={generar}>Generar Reporte</button>
        </div>
      </div>

      {datos.length > 0 && (
        <>
          <div className="tarjetas" style={{ marginBottom: '1rem' }}>
            <div className="tarjeta">
              <h3>Total Ventas</h3>
              <div className="numero">Q{totalGeneral.toFixed(2)}</div>
            </div>
            <div className="tarjeta">
              <h3>Transacciones</h3>
              <div className="numero">{datos.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vendedor</th>
                <th>Total Venta</th>
              </tr>
            </thead>
            <tbody>
              {datos.map(v => (
                <tr key={v.id}>
                  <td>{new Date(v.fecha_venta).toLocaleString()}</td>
                  <td>{v.perfiles?.nombre}</td>
                  <td style={{ fontWeight: 'bold' }}>Q{Number(v.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Layout>
  )
}
