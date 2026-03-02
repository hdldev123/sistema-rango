import { StatusPedido } from './enums';

/**
 * Interface que representa uma linha da tabela `pedidos`.
 */
export interface Pedido {
  id: number;
  cliente_id: number;
  data_criacao: string;
  data_entrega: string | null;
  valor_total: number;
  status: StatusPedido;
  observacoes: string | null;
}
