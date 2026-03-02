import { supabase } from '../config/database';
import { StatusPedido, StatusPedidoLabel } from '../models/enums';
import {
  DashboardKpisDto,
  PedidosPorMesDto,
  DistribuicaoStatusDto,
  DashboardCompletoDto,
} from '../dtos/dashboard.dto';

// ─── KPIs ────────────────────────────────────────────────────────────
export async function obterKpisAsync(): Promise<DashboardKpisDto> {
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setUTCDate(amanha.getUTCDate() + 1);

  // Executar consultas em paralelo para performance
  const [pedidosResult, clientesResult, pedidosHojeResult] = await Promise.all([
    // Todos os pedidos (status + valor)
    supabase.from('pedidos').select('status, valor_total, data_criacao'),
    // Total de clientes
    supabase.from('clientes').select('id', { count: 'exact', head: true }),
    // Pedidos criados hoje
    supabase
      .from('pedidos')
      .select('status, valor_total')
      .gte('data_criacao', hoje.toISOString())
      .lt('data_criacao', amanha.toISOString()),
  ]);

  const pedidos = pedidosResult.data || [];
  const totalPedidos = pedidos.length;
  const totalClientes = clientesResult.count || 0;

  // Receita total (apenas pedidos entregues)
  const receitaTotal = pedidos
    .filter((p: any) => p.status === StatusPedido.Entregue)
    .reduce((sum: number, p: any) => sum + Number(p.valor_total), 0);

  // Pedidos pendentes (Pendente + EmProducao + Pronto)
  const pedidosPendentes = pedidos.filter((p: any) =>
    [StatusPedido.Pendente, StatusPedido.EmProducao, StatusPedido.Pronto].includes(p.status),
  ).length;

  const pedidosHoje = pedidosHojeResult.data || [];
  const receitaHoje = pedidosHoje
    .filter((p: any) => p.status === StatusPedido.Entregue)
    .reduce((sum: number, p: any) => sum + Number(p.valor_total), 0);

  return {
    receitaTotal,
    totalPedidos,
    totalClientes,
    pedidosPendentes,
    pedidosHoje: pedidosHoje.length,
    receitaHoje,
  };
}

// ─── Pedidos por Mês ─────────────────────────────────────────────────
export async function obterPedidosPorMesAsync(meses: number = 6): Promise<PedidosPorMesDto[]> {
  const dataInicio = new Date();
  dataInicio.setUTCMonth(dataInicio.getUTCMonth() - meses + 1);
  dataInicio.setUTCDate(1);
  dataInicio.setUTCHours(0, 0, 0, 0);

  const nomesMeses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('data_criacao, status, valor_total')
    .gte('data_criacao', dataInicio.toISOString());

  if (error) throw new Error(error.message);

  // Agrupar por ano/mês no lado do cliente
  const grupoMap = new Map<string, { ano: number; mes: number; totalPedidos: number; receitaTotal: number }>();

  for (const p of pedidos || []) {
    const data = new Date(p.data_criacao);
    const ano = data.getUTCFullYear();
    const mes = data.getUTCMonth() + 1;
    const key = `${ano}-${mes}`;

    if (!grupoMap.has(key)) {
      grupoMap.set(key, { ano, mes, totalPedidos: 0, receitaTotal: 0 });
    }
    const grupo = grupoMap.get(key)!;
    grupo.totalPedidos++;
    if (p.status === StatusPedido.Entregue) {
      grupo.receitaTotal += Number(p.valor_total);
    }
  }

  return Array.from(grupoMap.values())
    .sort((a, b) => a.ano - b.ano || a.mes - b.mes)
    .map((d) => ({
      ano: d.ano,
      mes: d.mes,
      mesNome: nomesMeses[d.mes] || '',
      totalPedidos: d.totalPedidos,
      receitaTotal: d.receitaTotal,
    }));
}

// ─── Distribuição de Status ──────────────────────────────────────────
export async function obterDistribuicaoStatusAsync(): Promise<DistribuicaoStatusDto[]> {
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('status');

  if (error) throw new Error(error.message);

  const total = (pedidos || []).length;
  if (total === 0) return [];

  // Agrupar por status no lado do cliente
  const statusCount = new Map<number, number>();
  for (const p of pedidos || []) {
    statusCount.set(p.status, (statusCount.get(p.status) || 0) + 1);
  }

  return Array.from(statusCount.entries()).map(([status, quantidade]) => ({
    status: StatusPedidoLabel[status as StatusPedido] || status.toString(),
    quantidade,
    percentual: Math.round((quantidade / total) * 10000) / 100,
  }));
}

// ─── Dashboard Completo ──────────────────────────────────────────────
export async function obterDashboardCompletoAsync(): Promise<DashboardCompletoDto> {
  const [kpis, pedidosPorMes, distribuicaoStatus] = await Promise.all([
    obterKpisAsync(),
    obterPedidosPorMesAsync(),
    obterDistribuicaoStatusAsync(),
  ]);

  return { kpis, pedidosPorMes, distribuicaoStatus };
}
