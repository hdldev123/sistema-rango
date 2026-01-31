using Backend.DTOs.Common;
using Backend.DTOs.Pedidos;
using Backend.Models.Enums;

namespace Backend.Services.Interfaces;

public interface IPedidoService
{
    Task<ResultadoPaginadoDto<PedidoResumoDto>> ObterTodosAsync(PaginacaoDto paginacao, StatusPedido? status = null, DateTime? dataInicio = null, DateTime? dataFim = null);
    Task<PedidoDto?> ObterPorIdAsync(int id);
    Task<(PedidoDto? pedido, List<string>? erros)> CriarAsync(CriarPedidoDto dto);
    Task<PedidoDto?> AtualizarStatusAsync(int id, AtualizarStatusDto dto);
    Task<List<PedidoDto>> ObterRotasHojeAsync();
}
