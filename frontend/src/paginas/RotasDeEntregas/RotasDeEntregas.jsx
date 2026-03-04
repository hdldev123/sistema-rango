import React, { useState, useEffect, useCallback } from 'react';
import { buscarRotasDeEntrega } from '../../servicos/apiEntregas';
import { buscarPedidosPorStatus } from '../../servicos/apiPedidos';
import { usePedidos } from '../../contextos/ContextoPedidos';
import Spinner from '../../componentes/Spinner/Spinner';

// Constante para máximo de pedidos por rota
const MAX_PEDIDOS_POR_ROTA = 10;

// Função para criar rotas automáticas (máximo 10 pedidos por rota)
const criarRotasAutomaticas = (pedidos) => {
  const rotas = [];
  
  for (let i = 0; i < pedidos.length; i += MAX_PEDIDOS_POR_ROTA) {
    const pedidosRota = pedidos.slice(i, i + MAX_PEDIDOS_POR_ROTA);
    const numeroRota = Math.floor(i / MAX_PEDIDOS_POR_ROTA) + 1;
    
    // Calcular valor total da rota
    const valorTotal = pedidosRota.reduce((total, pedido) => total + pedido.total, 0);
    
    // Extrair CEPs únicos para otimização
    const cepsUnicos = [...new Set(pedidosRota.map(pedido => 
      pedido.cliente?.endereco?.split(',').pop()?.trim() || 'N/A'
    ))];
    
    rotas.push({
      id: numeroRota,
      numero: numeroRota,
      pedidos: pedidosRota,
      valorTotal,
      cepsUnicos,
      status: 'AGUARDANDO', // AGUARDANDO, EM_ENTREGA, CONCLUIDA
      dataInicio: null,
      dataConclusao: null
    });
  }
  
  return rotas;
};

// Mapeamento de estilos do status do card
const statusCardBorder = {
  aguardando: 'border-l-aviso',
  em_entrega: 'border-l-info',
  concluida: 'border-l-sucesso',
};

const statusBadgeClasses = {
  AGUARDANDO: 'bg-aviso/10 text-aviso',
  EM_ENTREGA: 'bg-info/10 text-info',
  CONCLUIDA: 'bg-sucesso/10 text-sucesso',
};

function RotasDeEntrega() {
  const [rotas, setRotas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [rotaAtualizando, setRotaAtualizando] = useState(null);

  // Usar contexto de pedidos para atualizações em tempo real
  const { alterarStatusPedido, notificacao } = usePedidos();

  const carregarRotasDeEntrega = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      // Buscar pedidos prontos/em entrega via endpoint de entregas
      const resposta = await buscarRotasDeEntrega();
      
      if (resposta.dados && resposta.dados.length > 0) {
        const rotasCriadas = criarRotasAutomaticas(resposta.dados);
        setRotas(rotasCriadas);
      } else {
        setRotas([]);
      }
    } catch (err) {
      setErro("Não foi possível carregar as rotas de entrega.");
      console.error('Erro ao carregar rotas:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarRotasDeEntrega();
  }, [carregarRotasDeEntrega]);

  // Função para iniciar rota (mudar status dos pedidos para EM_ENTREGA)
  const iniciarRota = useCallback(async (rota) => {
    setRotaAtualizando(rota.id);
    
    try {
      // Atualizar status de todos os pedidos da rota para A_CAMINHO
      const promessas = rota.pedidos.map(pedido => 
        alterarStatusPedido(pedido.id, 'A_CAMINHO')
      );
      
      await Promise.all(promessas);
      
      // Atualizar status da rota localmente
      setRotas(prevRotas => 
        prevRotas.map(r => 
          r.id === rota.id 
            ? { ...r, status: 'EM_ENTREGA', dataInicio: new Date() }
            : r
        )
      );
      
      // Recarregar rotas após mudança
      setTimeout(() => {
        carregarRotasDeEntrega();
      }, 1000);
      
    } catch (err) {
      setErro(`Erro ao iniciar rota ${rota.numero}: ${err.message}`);
    } finally {
      setRotaAtualizando(null);
    }
  }, [alterarStatusPedido, carregarRotasDeEntrega]);

  // Função para marcar pedido como entregue
  const marcarPedidoEntregue = useCallback(async (pedido, rotaId) => {
    try {
      await alterarStatusPedido(pedido.id, 'ENTREGUE');
      
      // Atualizar localmente removendo o pedido da rota
      setRotas(prevRotas => 
        prevRotas.map(rota => {
          if (rota.id === rotaId) {
            const pedidosAtualizados = rota.pedidos.filter(p => p.id !== pedido.id);
            return {
              ...rota,
              pedidos: pedidosAtualizados,
              status: pedidosAtualizados.length === 0 ? 'CONCLUIDA' : rota.status,
              dataConclusao: pedidosAtualizados.length === 0 ? new Date() : null
            };
          }
          return rota;
        })
      );
      
    } catch (err) {
      setErro(`Erro ao marcar pedido como entregue: ${err.message}`);
    }
  }, [alterarStatusPedido]);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarHora = (data) => {
    return data ? new Date(data).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '';
  };

  return (
    <div className="animate-fade-in">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grafite-800">Rotas de Entrega</h1>
          <p className="mt-1 text-sm text-grafite-400">
            Rotas criadas automaticamente com pedidos prontos para entrega
          </p>
        </div>
        
        <button 
          className="inline-flex items-center gap-2 rounded-xl border border-grafite-300 px-5 py-2.5 text-sm font-medium text-grafite-600 transition-colors hover:bg-grafite-50 disabled:opacity-50"
          onClick={carregarRotasDeEntrega}
          disabled={carregando}
        >
          🔄 Atualizar Rotas
        </button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-grafite-100 bg-white p-5 text-center shadow-soft">
          <span className="block text-3xl font-bold text-primary-500">{rotas.length}</span>
          <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-grafite-400">Rotas Criadas</span>
        </div>
        <div className="rounded-2xl border border-grafite-100 bg-white p-5 text-center shadow-soft">
          <span className="block text-3xl font-bold text-primary-500">
            {rotas.reduce((total, rota) => total + rota.pedidos.length, 0)}
          </span>
          <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-grafite-400">Pedidos Prontos</span>
        </div>
        <div className="rounded-2xl border border-grafite-100 bg-white p-5 text-center shadow-soft">
          <span className="block text-3xl font-bold text-primary-500">
            {formatarMoeda(rotas.reduce((total, rota) => total + rota.valorTotal, 0))}
          </span>
          <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-grafite-400">Valor Total</span>
        </div>
      </div>

      {carregando && <Spinner />}
      {erro && (
        <div className="mb-4 rounded-xl border border-erro/20 bg-erro/10 px-4 py-3 text-sm font-medium text-erro">
          {erro}
        </div>
      )}
      
      {!carregando && rotas.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-grafite-100 bg-white py-16 text-center shadow-soft">
          <div className="mb-4 text-5xl">🚚</div>
          <h3 className="text-lg font-semibold text-grafite-700">Nenhuma rota disponível</h3>
          <p className="mt-1 text-sm text-grafite-400">Não há pedidos prontos para entrega no momento.</p>
        </div>
      )}

      <div className="space-y-6">
        {rotas.map(rota => (
          <div
            key={rota.id}
            className={`rounded-2xl border border-l-4 bg-white shadow-soft transition-shadow hover:shadow-lg ${statusCardBorder[rota.status.toLowerCase()] || 'border-l-grafite-300'}`}
          >
            {/* Header da rota */}
            <div className="flex flex-col gap-3 border-b border-grafite-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-grafite-800">Rota de Entrega {rota.numero}</h2>
                <div className="mt-1 flex items-center gap-3 text-sm text-grafite-500">
                  <span className="font-medium">{rota.pedidos.length} pedidos</span>
                  <span className="text-grafite-300">•</span>
                  <span className="font-semibold text-primary-500">{formatarMoeda(rota.valorTotal)}</span>
                </div>
              </div>
              
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[rota.status] || 'bg-grafite-100 text-grafite-600'}`}>
                {rota.status === 'AGUARDANDO' && '⏳ Aguardando'}
                {rota.status === 'EM_ENTREGA' && '🚚 Em Entrega'}
                {rota.status === 'CONCLUIDA' && '✅ Concluída'}
              </span>
            </div>

            {/* CEPs */}
            <div className="border-b border-grafite-100 px-5 py-3">
              <strong className="text-xs font-semibold uppercase tracking-wider text-grafite-400">CEPs da rota:</strong>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {rota.cepsUnicos.map((cep, index) => (
                  <span key={index} className="rounded-lg bg-grafite-100 px-2.5 py-1 text-xs font-medium text-grafite-600">{cep}</span>
                ))}
              </div>
            </div>

            {/* Lista de pedidos */}
            <div className="divide-y divide-grafite-100 px-5">
              {rota.pedidos.map(pedido => (
                <div key={pedido.id} className="flex items-center justify-between py-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-grafite-800">{pedido.cliente?.nome || `Cliente ${pedido.clienteId}`}</h4>
                    <p className="mt-0.5 truncate text-sm text-grafite-400">{pedido.cliente?.endereco || 'Endereço não disponível'}</p>
                    <p className="text-sm text-grafite-400">📞 {pedido.cliente?.telefone || 'Telefone não disponível'}</p>
                    <span className="mt-1 inline-block text-sm font-semibold text-primary-500">{formatarMoeda(pedido.total)}</span>
                  </div>
                  
                  {rota.status === 'EM_ENTREGA' && (
                    <button
                      className="ml-4 rounded-xl bg-sucesso px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md"
                      onClick={() => marcarPedidoEntregue(pedido, rota.id)}
                    >
                      ✓ Entregue
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Ações da rota */}
            <div className="border-t border-grafite-100 px-5 py-4">
              {rota.status === 'AGUARDANDO' && (
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
                  onClick={() => iniciarRota(rota)}
                  disabled={rotaAtualizando === rota.id}
                >
                  {rotaAtualizando === rota.id ? '⏳ Iniciando...' : '🚚 Iniciar Rota'}
                </button>
              )}
              
              {rota.status === 'EM_ENTREGA' && rota.dataInicio && (
                <div className="text-sm text-info">
                  <span>Iniciada às {formatarHora(rota.dataInicio)}</span>
                </div>
              )}
              
              {rota.status === 'CONCLUIDA' && rota.dataConclusao && (
                <div className="text-sm font-medium text-sucesso">
                  <span>✅ Concluída às {formatarHora(rota.dataConclusao)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RotasDeEntrega;
