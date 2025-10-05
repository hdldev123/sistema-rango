import { simularLatencia } from './api';
import clientesMock from '../mock/clientes.json';

// Simula um "banco de dados" em memória para persistir as alterações durante a sessão.
let clientesEmMemoria = [...clientesMock];

export const buscarClientes = (params = {}) => {
  return simularLatencia(() => {
    // Simulação de filtro, paginação e ordenação seria implementada aqui
    return {
      dados: clientesEmMemoria,
      totalItens: clientesEmMemoria.length,
    };
  });
};

export const criarCliente = (novoCliente) => {
    return simularLatencia(() => {
        const clienteParaAdicionar = {
            id: Date.now(), // ID simples para simulação
            ...novoCliente
        };
        clientesEmMemoria.push(clienteParaAdicionar);
        return clienteParaAdicionar;
    });
}

export const atualizarCliente = (id, clienteAtualizado) => {
    return simularLatencia(() => {
        const index = clientesEmMemoria.findIndex(c => c.id === id);
        if (index !== -1) {
            clientesEmMemoria[index] = { ...clientesEmMemoria[index], ...clienteAtualizado };
            return clientesEmMemoria[index];
        }
        throw new Error("Cliente não encontrado");
    });
}

export const deletarCliente = (id) => {
    return simularLatencia(() => {
        const index = clientesEmMemoria.findIndex(c => c.id === id);
        if (index !== -1) {
            clientesEmMemoria.splice(index, 1);
            return { mensagem: "Cliente excluído com sucesso" };
        }
        throw new Error("Cliente não encontrado");
    });
}
