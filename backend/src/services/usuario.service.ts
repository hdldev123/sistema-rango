import { supabase } from '../config/database';
import { PerfilUsuario, PerfilUsuarioLabel } from '../models/enums';
import {
  UsuarioDto,
  CriarUsuarioDto,
  AtualizarUsuarioDto,
  AlterarSenhaDto,
} from '../dtos/usuario.dto';
import { PaginacaoDto, ResultadoPaginadoDto, criarResultadoPaginado } from '../dtos/common.dto';
import { hashSenha, verificarSenha } from './auth.service';
import { InvalidOperationError } from '../middlewares/error.middleware';

// ─── Mapper ──────────────────────────────────────────────────────────
function mapToDto(u: any): UsuarioDto {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    perfil: PerfilUsuarioLabel[u.perfil as PerfilUsuario] || u.perfil.toString(),
    dataCriacao: u.data_criacao,
    ativo: u.ativo,
  };
}

// ─── Listar (paginado) ──────────────────────────────────────────────
export async function obterTodosAsync(
  paginacao: PaginacaoDto,
): Promise<ResultadoPaginadoDto<UsuarioDto>> {
  const { data, count, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, perfil, data_criacao, ativo', { count: 'exact' })
    .order('data_criacao', { ascending: false })
    .range(
      (paginacao.pagina - 1) * paginacao.tamanhoPagina,
      paginacao.pagina * paginacao.tamanhoPagina - 1,
    );

  if (error) throw new Error(error.message);

  const dados = (data || []).map(mapToDto);
  return criarResultadoPaginado(dados, paginacao.pagina, paginacao.tamanhoPagina, count || 0);
}

// ─── Buscar por ID ───────────────────────────────────────────────────
export async function obterPorIdAsync(id: number): Promise<UsuarioDto | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, perfil, data_criacao, ativo')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapToDto(data);
}

// ─── Criar ───────────────────────────────────────────────────────────
export async function criarAsync(dto: CriarUsuarioDto): Promise<UsuarioDto> {
  // Validação de email único
  const { data: existente } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', dto.email)
    .maybeSingle();

  if (existente) {
    throw new InvalidOperationError('Já existe um usuário cadastrado com este email.');
  }

  const senhaHasheada = await hashSenha(dto.senha);

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nome: dto.nome,
      email: dto.email,
      senha_hash: senhaHasheada,
      perfil: dto.perfil,
      ativo: true,
    })
    .select('id, nome, email, perfil, data_criacao, ativo')
    .single();

  if (error) throw new Error(error.message);
  return mapToDto(data);
}

// ─── Atualizar ───────────────────────────────────────────────────────
export async function atualizarAsync(
  id: number,
  dto: AtualizarUsuarioDto,
): Promise<UsuarioDto | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .update({
      nome: dto.nome,
      email: dto.email,
      perfil: dto.perfil,
      ativo: dto.ativo,
    })
    .eq('id', id)
    .select('id, nome, email, perfil, data_criacao, ativo')
    .single();

  if (error) return null;
  return mapToDto(data);
}

// ─── Excluir (com proteção contra auto-exclusão) ─────────────────────
export async function excluirAsync(id: number, usuarioLogadoId: number): Promise<boolean> {
  if (id === usuarioLogadoId) {
    throw new InvalidOperationError('Você não pode excluir a si mesmo.');
  }

  const { data, error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error || !data) return false;
  return true;
}

// ─── Alterar Senha ───────────────────────────────────────────────────
export async function alterarSenhaAsync(id: number, dto: AlterarSenhaDto): Promise<boolean> {
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, senha_hash')
    .eq('id', id)
    .single();

  if (error || !usuario) return false;

  const senhaCorreta = await verificarSenha(dto.senhaAtual, usuario.senha_hash);
  if (!senhaCorreta) {
    throw new InvalidOperationError('Senha atual incorreta.');
  }

  const novaSenhaHash = await hashSenha(dto.novaSenha);

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ senha_hash: novaSenhaHash })
    .eq('id', id);

  if (updateError) throw new Error(updateError.message);
  return true;
}
