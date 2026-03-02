import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { supabase } from './config/database';
import { PerfilUsuario } from './models/enums';

dotenv.config();

const BCRYPT_ROUNDS = 12;

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Testar conexão
  const { error: testError } = await supabase.from('usuarios').select('id', { count: 'exact', head: true });
  if (testError) {
    console.error('❌ Erro ao conectar ao Supabase:', testError.message);
    process.exit(1);
  }
  console.log('✅ Conexão com Supabase estabelecida.');

  // Verifica se o admin já existe
  const { data: adminExistente } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', 'admin@xsalgados.com')
    .maybeSingle();

  if (adminExistente) {
    console.log('⚠️  Usuário admin já existe. Atualizando senha para "admin123"...');
    const senhaHash = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
    const { error } = await supabase
      .from('usuarios')
      .update({ senha_hash: senhaHash })
      .eq('id', adminExistente.id);

    if (error) throw new Error(error.message);
    console.log('✅ Senha do admin atualizada com bcrypt.');
  } else {
    const senhaHash = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
    const { error } = await supabase
      .from('usuarios')
      .insert({
        nome: 'Administrador',
        email: 'admin@xsalgados.com',
        senha_hash: senhaHash,
        perfil: PerfilUsuario.Administrador,
        ativo: true,
      });

    if (error) throw new Error(error.message);
    console.log('✅ Usuário admin criado com sucesso!');
  }

  console.log('');
  console.log('📋 Credenciais do admin:');
  console.log('   Email: admin@xsalgados.com');
  console.log('   Senha: admin123');
  console.log('');

  console.log('🌱 Seed finalizado!');
}

seed().catch((error) => {
  console.error('❌ Erro no seed:', error);
  process.exit(1);
});
