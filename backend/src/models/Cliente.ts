/**
 * Interface que representa uma linha da tabela `clientes`.
 */
export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  cep: string | null;
  data_criacao: string;
}
