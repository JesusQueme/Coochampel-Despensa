import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_URL_DE_SUPABASE'
const supabaseKey = 'TU_CLAVE_PUBLICA_DE_SUPABASE'

export const supabase = createClient(supabaseUrl, supabaseKey)
