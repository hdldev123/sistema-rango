import { simularLatencia } from './api';
import produtosMock from '../mock/produtos.json';

let produtosEmMemoria = [...produtosMock];

export const buscarProdutos = (params = {}) => {
  return simularLatencia(() => {
    return {
      dados: produtosEmMemoria,
      totalItens: produtosEmMemoria.length,
    };
  });
};

export const criarProduto = (novoProduto) => {
    return simularLatencia(() => {
        const produtoParaAdicionar = {
            id: Date.now(),
            ...novoProduto
        };
        produtosEmMemoria.push(produtoParaAdicionar);
        return produtoParaAdicionar;
    });
}

export const atualizarProduto = (id, produtoAtualizado) => {
    return simularLatencia(() => {
        const index = produtosEmMemoria.findIndex(p => p.id === id);
        if (index !== -1) {
            produtosEmMemoria[index] = { ...produtosEmMemoria[index], ...produtoAtualizado };
            return produtosEmMemoria[index];
        }
        throw new Error("Produto não encontrado");
    });
}

export const deletarProduto = (id) => {
    return simularLatencia(() => {
        const index = produtosEmMemoria.findIndex(p => p.id === id);
        if (index !== -1) {
            produtosEmMemoria.splice(index, 1);
            return { mensagem: "Produto excluído com sucesso" };
        }
        throw new Error("Produto não encontrado");
    });
}
