using Backend.DTOs.Dashboard;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Obtém KPIs principais do dashboard
    /// </summary>
    [HttpGet("kpis")]
    public async Task<ActionResult<DashboardKpisDto>> ObterKpis()
    {
        var kpis = await _dashboardService.ObterKpisAsync();
        return Ok(kpis);
    }

    /// <summary>
    /// Obtém dados de pedidos por mês (últimos 6 meses por padrão)
    /// </summary>
    [HttpGet("pedidos-por-mes")]
    public async Task<ActionResult<List<PedidosPorMesDto>>> ObterPedidosPorMes([FromQuery] int meses = 6)
    {
        var dados = await _dashboardService.ObterPedidosPorMesAsync(meses);
        return Ok(dados);
    }

    /// <summary>
    /// Obtém distribuição de pedidos por status
    /// </summary>
    [HttpGet("distribuicao-status")]
    public async Task<ActionResult<List<DistribuicaoStatusDto>>> ObterDistribuicaoStatus()
    {
        var dados = await _dashboardService.ObterDistribuicaoStatusAsync();
        return Ok(dados);
    }

    /// <summary>
    /// Obtém dashboard completo com todos os dados
    /// </summary>
    [HttpGet("completo")]
    public async Task<ActionResult<DashboardCompletoDto>> ObterDashboardCompleto()
    {
        var dashboard = await _dashboardService.ObterDashboardCompletoAsync();
        return Ok(dashboard);
    }
}
