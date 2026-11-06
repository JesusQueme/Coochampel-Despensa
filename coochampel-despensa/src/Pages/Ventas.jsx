import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../../Atentication/AuthContext'
import Layout from '../componentes/Layout'

export default function Ventas() {
  const { perfil } = useAuth()
  const [buscar, setBuscar] = useState('')
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [mensaje, setMensaje] = useState('')

  const buscarProducto = async () => {
    if (!buscar) return setProductos([])
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', 'activo')
      .or(`nombre.ilike.%${buscar}%,codigo.eq.${buscar}`)
      .limit(8)
    setProductos(data || [])
  }

  const agregarAlCarrito = (prod) => {
    if (prod.stock <= 0) return alert('Sin stock disponible')
    const existe = carrito.find(i => i.id === prod.id)
    if (existe) {
      if (existe.cantidad >= prod.stock) return alert('Stock insuficiente')
      setCarrito(carrito.map(i => i.id === prod.id ? {...i, cantidad:i.cantidad+1} : i))
    } else {
      setCarrito([...carrito, {...prod, cantidad:1}])
    }
  }

  const quitar = (id) => setCarrito(carrito.filter(i => i.id !== id))
  const cambiarCant = (id, cant) => {
    if (cant <= 0) return quitar(id)
    setCarrito(carrito.map(i => i.id === id ? {...i, cantidad:Math.min(cant, i.stock)} : i))
  }

  const total = carrito.reduce((s, i) => s + i.precio_venta * i.cantidad, 0)

  const cobrar = async () => {
    if (!carrito.length) return
    setMensaje('Procesando...')
    const { data: venta, error: e1 } = await supabase
      .from('ventas')
      .insert([{ id_usuario: perfil.id, total }])
      .select()
      .single()
    if (e1) return alert('Error creando venta')

    for (const item of carrito) {
      const ganancia = (item.precio_venta - item.precio_compra) * item.cantidad
      await supabase.from('detalle_venta').insert([{
        id_venta: venta.id, id_producto: item.id, cantidad: item.cantidad,
        precio_unitario: item.precio_venta, ganancia
      }])
      await supabase.from('productos').update({ stock: item.stock - item.cantidad }).eq('id', item.id)
    }
    setMensaje('✅ Venta registrada')
    setCarrito([])
    setBuscar('')
    setTimeout(() => setMensaje(''), 3000)
  }

  return (
    <Layout>
      <h1>Punto de Venta</h1>
      {mensaje && <div className="notificacion">{mensaje}</div>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 350px',gap:'1.5rem'}}>
        <div>
          <h3>Buscar Producto</h3>
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
            <input style={{flex:1}} placeholder="Nombre o código" value={buscar} onChange={(e)=>setBuscar(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&buscarProducto()} />
            <button onClick={buscarProducto}>Buscar</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'0.8rem'}}>
            {productos.map(p => (
              <div key={p.id} style={{background:'white',padding:'1rem',borderRadius:'0.5rem',cursor:'pointer',boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}} onClick={()=>agregarAlCarrito(p)}>
                <strong>{p.nombre}</strong><br/>
                Q{Number(p.precio_venta).toFixed(2)}<br/>
                <small>Stock: {p.stock}</small>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:'white',padding:'1.2rem',borderRadius:'0.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
          <h3>Carrito</h3>
          {carrito.length === 0 ? <p style={{color:'#888'}}>Sin productos</p> : carrito.map(item => (
            <div key={item.id} style={{borderBottom:'1px solid #eee',padding:'0.5rem 0'}}>
              <div><strong>{item.nombre}</strong></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <input type="number" min="1" max={item.stock} value={item.cantidad} onChange={(e)=>cambiarCant(item.id,Number(e.target.value))} style={{width:'60px',padding:'0.3rem'}} />
                <span>Q{(item.precio_venta*item.cantidad).toFixed(2)}</span>
                <button className="rojo" style={{padding:'0.3rem 0.5rem'}} onClick={()=>quitar(item.id)}>✕</button>
              </div>
            </div>
          ))}
          <div style={{marginTop:'1rem',fontSize:'1.3rem',fontWeight:'bold'}}>Total: Q{total.toFixed(2)}</div>
          <button className="verde" style={{width:'100%',marginTop:'1rem',padding:'0.9rem',fontSize:'1rem'}} onClick={cobrar}>✅ Cobrar y Finalizar</button>
        </div>
      </div>
    </Layout>
  )
}
