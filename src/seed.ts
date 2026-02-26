import 'reflect-metadata';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { AppDataSource } from './config/database';
import { Usuario } from './models/Usuario';
import { PerfilUsuario } from './models/enums';

dotenv.config();

const BCRYPT_ROUNDS = 12;

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  await AppDataSource.initialize();
  console.log('✅ Conexão com banco de dados estabelecida.');

  const usuarioRepo = AppDataSource.getRepository(Usuario);

  // Verifica se o admin já existe
  const adminExistente = await usuarioRepo.findOne({
    where: { email: 'admin@xsalgados.com' },
  });

  if (adminExistente) {
    console.log('⚠️  Usuário admin já existe. Atualizando senha para "admin123"...');
    adminExistente.senhaHash = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
    await usuarioRepo.save(adminExistente);
    console.log('✅ Senha do admin atualizada com bcrypt.');
  } else {
    const senhaHash = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
    const admin = usuarioRepo.create({
      nome: 'Administrador',
      email: 'admin@xsalgados.com',
      senhaHash,
      perfil: PerfilUsuario.Administrador,
      ativo: true,
    });

    await usuarioRepo.save(admin);
    console.log('✅ Usuário admin criado com sucesso!');
  }

  console.log('');
  console.log('📋 Credenciais do admin:');
  console.log('   Email: admin@xsalgados.com');
  console.log('   Senha: admin123');
  console.log('');

  await AppDataSource.destroy();
  console.log('🌱 Seed finalizado!');
}

seed().catch((error) => {
  console.error('❌ Erro no seed:', error);
  process.exit(1);
});
