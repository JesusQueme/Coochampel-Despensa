import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../../Atentication/AuthContext'
import Layout from '../componentes/Layout'

export default function Inventario() {
  const { perfil } = useAuth()
  const esAdmin = perfil?.rol === 'administrador'
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [buscar, setBuscar] = useState('')
  const [catFiltro, setCatFiltro] = useState('')
  const [codigoFiltro, setCodigoFiltro] = useState('')
  const [modalAgregar, setModalAgregar] = useState(false)
  const [nuevo, setNuevo] = useState({
    codigo: '', nombre: '', id_categoria: '', precio_compra: '',
    precio_venta: '', stock: '', fecha_caducidad: '', id_proveedor: ''
  })

  useEffect(() => {
    cargarDatos()
    const cargarCats = async () => {
      const { data } = await supabase.from('categorias').select('*')
      if (data) setCategorias(data)
    }
    cargarCats()
  }, [])

  const cargarDatos = async () => {
    let consulta = supabase.from('productos').select(`
      *, categorias(nombre), proveedores(nombre)
    `).eq('estado', 'activo')
    
    if (buscar) consulta = consulta.ilike('nombre', `%${buscar}%`)
    if (catFiltro) consulta = consulta.eq('id_categoria', catFiltro)
    if (codigoFiltro) consulta = consulta.ilike('codigo', `%${codigoFiltro}%`)

    const { data } = await consulta
    if (data) setProductos(data)
  }

  const guardarProducto = async (e) => {
    e.preventDefault()
    if (!esAdmin) return
    const { error } = await supabase.from('productos').insert([{
      ...nuevo,
      id_categoria: Number(nuevo.id_categoria),
      precio_compra: Number(nuevo.precio_compra),
      precio_venta: Number(nuevo.precio_venta),
      stock: Number(nuevo.stock)
    }])
    if (!error) {
      setNuevo({ codigo:'', nombre:'', id_categoria:'', precio_compra:'', precio_venta:'', stock:'', fecha_caducidad:'', id_proveedor:'' })
      setModalAgregar(false)
      cargarDatos()
    } else alert('Error al guardar')
  }

  const desactivar = async (id) => {
    if (!esAdmin || !confirm('¿Marcar como inactivo?')) return
    await supabase.from('productos').update({ estado: 'inactivo' }).eq('id', id)
    cargarDatos()
  }

  return (
    <Layout>
      <h1>Inventario de Productos</h1>

      <div className="filtros">
        <input placeholder="Buscar por nombre..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <select value={catFiltro} onChange={(e) => setCatFiltro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input placeholder="Código" value={codigoFiltro} onChange={(e) => setCodigoFiltro(e.target.value)} />
        <button onClick={cargarDatos}>Buscar</button>
        {esAdmin && <button className="verde" onClick={() => setModalAgregar(true)}>Agregar Producto</button>}
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio Compra</th><th>Precio Venta</th><th>Stock</th><th>Vencimiento</th>
            {esAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.codigo}</td>
              <td>{p.nombre}</td>
              <td>{p.categorias?.nombre || '—'}</td>
              <td>Q{Number(p.precio_compra).toFixed(2)}</td>
              <td>Q{Number(p.precio_venta).toFixed(2)}</td>
              <td className={p.stock <= p.stock_minimo ? 'bajo-stock' : ''}>{p.stock}</td>
              <td>{p.fecha_caducidad || '—'}</td>
              {esAdmin && <td><button className="rojo" onClick={() => desactivar(p.id)}>Inactivar</button></td>}
            </tr>
          ))}
        </tbody>
      </table>

      {modalAgregar && esAdmin && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'white',padding:'2rem',borderRadius:'0.5rem',width:'100%',maxWidth:'500px'}}>
            <h3>Agregar Producto</h3>
            <form onSubmit={guardarProducto}>
              <div className="grupo-form"><label>Código</label><input required value={nuevo.codigo} onChange={(e)=>setNuevo({...nuevo,codigo:e.target.value})} /></div>
              <div className="grupo-form"><label>Nombre</label><input required value={nuevo.nombre} onChange={(e)=>setNuevo({...nuevo,nombre:e.target.value})} /></div>
              <div className="grupo-form"><label>Categoría</label>
                <select required value={nuevo.id_categoria} onChange={(e)=>setNuevo({...nuevo,id_categoria:e.target.value})}>
                  <option value="">Seleccione</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grupo-form"><label>Precio Compra</label><input type="number" step="0.01" required value={nuevo.precio_compra} onChange={(e)=>setNuevo({...nuevo,precio_compra:e.target.value})} /></div>
              <div className="grupo-form"><label>Precio Venta</label><input type="number" step="0.01" required value={nuevo.precio_venta} onChange={(e)=>setNuevo({...nuevo,precio_venta:e.target.value})} /></div>
              <div className="grupo-form"><label>Stock Inicial</label><input type="number" required value={nuevo.stock} onChange={(e)=>setNuevo({...nuevo,stock:e.target.value})} /></div>
              <div className="grupo-form"><label>Fecha Caducidad</label><input type="date" value={nuevo.fecha_caducidad} onChange={(e)=>setNuevo({...nuevo,fecha_caducidad:e.target.value})} /></div>
              <button type="button" onClick={()=>setModalAgregar(false)}>Cancelar</button>
              <button type="submit" className="verde">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
