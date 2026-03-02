/**
 * Interface que representa uma linha da tabela `produtos`.
 */
export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  descricao: string | null;
  preco: number;
  ativo: boolean;
  data_criacao: string;
}
