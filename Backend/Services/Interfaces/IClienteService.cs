using Backend.DTOs.Clientes;
using Backend.DTOs.Common;

namespace Backend.Services.Interfaces;

public interface IClienteService
{
    Task<ResultadoPaginadoDto<ClienteDto>> ObterTodosAsync(PaginacaoDto paginacao, string? busca = null);
    Task<ClienteDto?> ObterPorIdAsync(int id);
    Task<ClienteDto> CriarAsync(CriarClienteDto dto);
    Task<ClienteDto?> AtualizarAsync(int id, AtualizarClienteDto dto);
    Task<(bool sucesso, string? mensagemErro)> ExcluirAsync(int id);
}
