import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Para depurar — verás esto en la consola del navegador (F12)
console.log('URL leída:', supabaseUrl)
console.log('¿Empieza con https?:', supabaseUrl?.startsWith('https://'))
console.log('Key existe:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno. Revisa tu archivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
