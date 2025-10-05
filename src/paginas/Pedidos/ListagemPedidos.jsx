import React, { useState, useEffect, useCallback } from 'react';
import { buscarPedidos } from '../../servicos/apiPedidos';
import Tabela from '../../componentes/Tabela/Tabela';
import Spinner from '../../componentes/Spinner/Spinner';
import '../PaginasListagem.css';

function ListagemPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarPedidos = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await buscarPedidos();
      setPedidos(dados.dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  const colunas = [
    { cabecalho: 'ID', chave: 'id' },
    { cabecalho: 'Cliente', render: (pedido) => pedido.cliente.nome },
    { cabecalho: 'Data', render: (pedido) => new Date(pedido.dataPedido).toLocaleDateString() },
    { cabecalho: 'Status', chave: 'status' },
    { cabecalho: 'Total', render: (pedido) => `R$ ${pedido.total.toFixed(2)}` },
  ];

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1 className="titulo-pagina">Pedidos</h1>
      </div>

      {carregando && <Spinner />}
      {erro && <p className="mensagem-erro">{erro}</p>}
      {!carregando && !erro && <Tabela colunas={colunas} dados={pedidos} />}
    </div>
  );
}

export default ListagemPedidos;
