using Backend.Data;
using Backend.DTOs.Dashboard;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardKpisDto> ObterKpisAsync()
    {
        var hoje = DateTime.UtcNow.Date;
        var amanha = hoje.AddDays(1);

        // Consultas otimizadas - executadas em paralelo
        var receitaTotalTask = _context.Pedidos
            .Where(p => p.Status == StatusPedido.Entregue)
            .SumAsync(p => (decimal?)p.ValorTotal) ?? Task.FromResult<decimal?>(0);

        var totalPedidosTask = _context.Pedidos.CountAsync();
        var totalClientesTask = _context.Clientes.CountAsync();

        var pedidosPendentesTask = _context.Pedidos
            .CountAsync(p => p.Status == StatusPedido.Pendente || 
                           p.Status == StatusPedido.EmProducao || 
                           p.Status == StatusPedido.Pronto);

        var pedidosHojeTask = _context.Pedidos
            .CountAsync(p => p.DataCriacao >= hoje && p.DataCriacao < amanha);

        var receitaHojeTask = _context.Pedidos
            .Where(p => p.DataCriacao >= hoje && 
                       p.DataCriacao < amanha && 
                       p.Status == StatusPedido.Entregue)
            .SumAsync(p => (decimal?)p.ValorTotal) ?? Task.FromResult<decimal?>(0);

        await Task.WhenAll(receitaTotalTask, totalPedidosTask, totalClientesTask, 
                          pedidosPendentesTask, pedidosHojeTask, receitaHojeTask);

        return new DashboardKpisDto
        {
            ReceitaTotal = await receitaTotalTask ?? 0,
            TotalPedidos = await totalPedidosTask,
            TotalClientes = await totalClientesTask,
            PedidosPendentes = await pedidosPendentesTask,
            PedidosHoje = await pedidosHojeTask,
            ReceitaHoje = await receitaHojeTask ?? 0
        };
    }

    public async Task<List<PedidosPorMesDto>> ObterPedidosPorMesAsync(int meses = 6)
    {
        var dataInicio = DateTime.UtcNow.AddMonths(-meses + 1).Date;
        dataInicio = new DateTime(dataInicio.Year, dataInicio.Month, 1);

        var dados = await _context.Pedidos
            .Where(p => p.DataCriacao >= dataInicio)
            .GroupBy(p => new { p.DataCriacao.Year, p.DataCriacao.Month })
            .Select(g => new
            {
                Ano = g.Key.Year,
                Mes = g.Key.Month,
                TotalPedidos = g.Count(),
                ReceitaTotal = g.Where(p => p.Status == StatusPedido.Entregue).Sum(p => p.ValorTotal)
            })
            .OrderBy(x => x.Ano)
            .ThenBy(x => x.Mes)
            .ToListAsync();

        var nomesMeses = new[] { "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
                                  "Jul", "Ago", "Set", "Out", "Nov", "Dez" };

        return dados.Select(d => new PedidosPorMesDto
        {
            Ano = d.Ano,
            Mes = d.Mes,
            MesNome = nomesMeses[d.Mes],
            TotalPedidos = d.TotalPedidos,
            ReceitaTotal = d.ReceitaTotal
        }).ToList();
    }

    public async Task<List<DistribuicaoStatusDto>> ObterDistribuicaoStatusAsync()
    {
        var total = await _context.Pedidos.CountAsync();
        if (total == 0)
        {
            return new List<DistribuicaoStatusDto>();
        }

        var distribuicao = await _context.Pedidos
            .GroupBy(p => p.Status)
            .Select(g => new
            {
                Status = g.Key,
                Quantidade = g.Count()
            })
            .ToListAsync();

        return distribuicao.Select(d => new DistribuicaoStatusDto
        {
            Status = FormatarStatus(d.Status),
            Quantidade = d.Quantidade,
            Percentual = Math.Round((decimal)d.Quantidade / total * 100, 2)
        }).ToList();
    }

    public async Task<DashboardCompletoDto> ObterDashboardCompletoAsync()
    {
        var kpisTask = ObterKpisAsync();
        var pedidosPorMesTask = ObterPedidosPorMesAsync();
        var distribuicaoStatusTask = ObterDistribuicaoStatusAsync();

        await Task.WhenAll(kpisTask, pedidosPorMesTask, distribuicaoStatusTask);

        return new DashboardCompletoDto
        {
            Kpis = await kpisTask,
            PedidosPorMes = await pedidosPorMesTask,
            DistribuicaoStatus = await distribuicaoStatusTask
        };
    }

    private static string FormatarStatus(StatusPedido status) => status switch
    {
        StatusPedido.Pendente => "Pendente",
        StatusPedido.EmProducao => "Em Produção",
        StatusPedido.Pronto => "Pronto",
        StatusPedido.EmEntrega => "Em Entrega",
        StatusPedido.Entregue => "Entregue",
        StatusPedido.Cancelado => "Cancelado",
        _ => status.ToString()
    };
}
