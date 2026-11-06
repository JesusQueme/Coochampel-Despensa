import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const sesion = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUsuario(session.user)
        const { data } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setPerfil(data)
      } else {
        setUsuario(null)
        setPerfil(null)
      }
      setCargando(false)
    })
    return () => sesion.data.subscription.unsubscribe()
  }, [])

  const iniciarSesion = async (correo, contraseña) => {
    return supabase.auth.signInWithPassword({ email: correo, password: contraseña })
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    setUsuario(null)
    setPerfil(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, perfil, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
