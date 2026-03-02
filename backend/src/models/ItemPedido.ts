/**
 * Interface que representa uma linha da tabela `itens_pedido`.
 */
export interface ItemPedido {
  id: number;
  pedido_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario_snapshot: number;
}
