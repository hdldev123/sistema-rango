using Backend.DTOs.Common;
using Backend.DTOs.Produtos;

namespace Backend.Services.Interfaces;

public interface IProdutoService
{
    Task<ResultadoPaginadoDto<ProdutoDto>> ObterTodosAsync(PaginacaoDto paginacao, string? categoria = null, bool? apenasAtivos = null);
    Task<ProdutoDto?> ObterPorIdAsync(int id);
    Task<List<string>> ObterCategoriasAsync();
    Task<ProdutoDto> CriarAsync(CriarProdutoDto dto);
    Task<ProdutoDto?> AtualizarAsync(int id, AtualizarProdutoDto dto);
    Task<bool> ExcluirAsync(int id);
}
