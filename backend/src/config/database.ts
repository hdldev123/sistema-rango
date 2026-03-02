/**
 * Configuração do cliente Supabase.
 * Usa SUPABASE_URL e SUPABASE_KEY (service_role) para acesso completo ao banco.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_KEY devem ser definidas no .env');
  process.exit(1);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Testa a conexão com o Supabase fazendo uma query simples.
 */
export async function testarConexao(): Promise<boolean> {
  try {
    const { error } = await supabase.from('usuarios').select('id', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Erro ao conectar ao Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('❌ Erro ao conectar ao Supabase:', err.message);
    return false;
  }
}
