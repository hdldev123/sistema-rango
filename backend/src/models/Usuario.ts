import { PerfilUsuario } from './enums';

/**
 * Interface que representa uma linha da tabela `usuarios`.
 * Nomes de propriedades = nomes das colunas no banco (snake_case).
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: PerfilUsuario;
  data_criacao: string;
  ativo: boolean;
}
