import { Request, Response, NextFunction } from 'express';
import * as pedidoService from '../services/pedido.service';

/**
 * GET /api/entregas/lote
 * Retorna o lote atual de entrega: pedidos prontos + total de itens acumulados.
 */
export async function obterLoteEntrega(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lote = await pedidoService.obterLoteEntregaAsync();
    res.json(lote);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/entregas/liberar-lote
 * Move os pedidos informados (por ID) com status Pronto(3) para Em Entrega(4).
 * Espera body: { pedidoIds: number[] }
 */
export async function liberarLote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pedidoIds } = req.body;

    if (!Array.isArray(pedidoIds) || pedidoIds.length === 0) {
      res.status(400).json({
        sucesso: false,
        mensagem: 'É necessário informar ao menos um pedidoId.',
      });
      return;
    }

    const resultado = await pedidoService.liberarLoteAsync(pedidoIds);
    res.json({
      sucesso: true,
      mensagem: `${resultado.pedidosAfetados} pedido(s) liberado(s) para entrega.`,
      pedidosAfetados: resultado.pedidosAfetados,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/entregas/em-transito
 * Retorna todos os pedidos atualmente em trânsito (status 4).
 */
export async function obterPedidosEmTransito(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resultado = await pedidoService.obterPedidosEmTransitoAsync();
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}
