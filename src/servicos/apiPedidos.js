import { simularLatencia } from './api';
import pedidosMock from '../mock/pedidos.json';
import clientesMock from '../mock/clientes.json';

// Pré-processa os pedidos para incluir os dados do cliente
const pedidosCompletos = pedidosMock.map(pedido => ({
    ...pedido,
    cliente: clientesMock.find(c => c.id === pedido.clienteId)
}));

export const buscarPedidos = (params = {}) => {
    return simularLatencia(() => {
        let dadosFiltrados = [...pedidosCompletos];

        if (params.filtro) {
            dadosFiltrados = dadosFiltrados.filter(p => 
                p.status.toLowerCase() === params.filtro.toLowerCase()
            );
        }

        return {
            dados: dadosFiltrados,
            totalItens: dadosFiltrados.length,
        };
    });
};
