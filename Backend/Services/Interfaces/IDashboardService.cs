using Backend.DTOs.Dashboard;

namespace Backend.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardKpisDto> ObterKpisAsync();
    Task<List<PedidosPorMesDto>> ObterPedidosPorMesAsync(int meses = 6);
    Task<List<DistribuicaoStatusDto>> ObterDistribuicaoStatusAsync();
    Task<DashboardCompletoDto> ObterDashboardCompletoAsync();
}
