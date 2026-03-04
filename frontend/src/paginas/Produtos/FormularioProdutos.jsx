import React, { useState, useEffect } from 'react';
import { criarProduto, atualizarProduto } from '../../servicos/apiProdutos';

function FormularioProduto({ produto, aoSalvar }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: 0,
    estoque: 0,
  });

  useEffect(() => {
    if (produto) {
      setFormData(produto);
    } else {
      setFormData({ nome: '', descricao: '', preco: 0, estoque: 0 });
    }
  }, [produto]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevState => ({ 
        ...prevState, 
        [name]: type === 'number' ? parseFloat(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (produto) {
        await atualizarProduto(produto.id, formData);
      } else {
        await criarProduto(formData);
      }
      aoSalvar();
    } catch (error) {
      console.error("Falha ao salvar produto:", error);
    }
  };

  const inputClasses = "w-full rounded-xl border border-grafite-200 bg-white px-4 py-2.5 text-sm text-grafite-800 transition-all duration-200 placeholder:text-grafite-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none";

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-grafite-700">Nome</label>
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className={inputClasses} />
      </div>
      <div className="mb-4">
        <label htmlFor="descricao" className="mb-1.5 block text-sm font-medium text-grafite-700">Descrição</label>
        <input type="text" name="descricao" value={formData.descricao} onChange={handleChange} className={inputClasses} />
      </div>
      <div className="mb-4">
        <label htmlFor="preco" className="mb-1.5 block text-sm font-medium text-grafite-700">Preço</label>
        <input type="number" name="preco" step="0.01" value={formData.preco} onChange={handleChange} className={inputClasses} />
      </div>
      <div className="mb-4">
        <label htmlFor="estoque" className="mb-1.5 block text-sm font-medium text-grafite-700">Estoque</label>
        <input type="number" name="estoque" value={formData.estoque} onChange={handleChange} className={inputClasses} />
      </div>
      <div className="mt-6 flex justify-end border-t border-grafite-200 pt-4">
        <button
          type="submit"
          className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-xl active:translate-y-0"
        >
          {produto ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

export default FormularioProduto;
