import { useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import Layout from '../componentes/Layout'

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '', correo: '' })
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    cargarProveedores()
  }, [])

  const cargarProveedores = async () => {
    const { data } = await supabase.from('proveedores').select('*').order('nombre')
    if (data) setProveedores(data)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (editando) {
      await supabase.from('proveedores').update(form).eq('id', editando)
    } else {
      await supabase.from('proveedores').insert([form])
    }
    setForm({ nombre: '', telefono: '', direccion: '', correo: '' })
    setEditando(null)
    cargarProveedores()
  }

  const editar = (p) => {
    setForm({ nombre: p.nombre, telefono: p.telefono, direccion: p.direccion, correo: p.correo })
    setEditando(p.id)
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await supabase.from('proveedores').delete().eq('id', id)
    cargarProveedores()
  }

  return (
    <Layout>
      <h1>Proveedores / Distribuidores</h1>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <h3>{editando ? 'Editar Proveedor' : 'Agregar Proveedor'}</h3>
        <form onSubmit={guardar}>
          <div className="grupo-form">
            <label>Nombre / Empresa</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div className="grupo-form">
            <label>Teléfono</label>
            <input
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div className="grupo-form">
            <label>Dirección</label>
            <input
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div className="grupo-form">
            <label>Correo</label>
            <input
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="verde">
            {editando ? 'Actualizar' : 'Guardar'}
          </button>
          {editando && (
            <button type="button" onClick={() => { setEditando(null); setForm({ nombre:'', telefono:'', direccion:'', correo:'' }) }}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map(p => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.telefono || '—'}</td>
              <td>{p.direccion || '—'}</td>
              <td>{p.correo || '—'}</td>
              <td>
                <button onClick={() => editar(p)}>Editar</button>
                <button className="rojo" onClick={() => eliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  )
}
