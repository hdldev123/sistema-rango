using Backend.DTOs.Common;
using Backend.DTOs.Usuarios;

namespace Backend.Services.Interfaces;

public interface IUsuarioService
{
    Task<ResultadoPaginadoDto<UsuarioDto>> ObterTodosAsync(PaginacaoDto paginacao);
    Task<UsuarioDto?> ObterPorIdAsync(int id);
    Task<UsuarioDto> CriarAsync(CriarUsuarioDto dto);
    Task<UsuarioDto?> AtualizarAsync(int id, AtualizarUsuarioDto dto);
    Task<bool> ExcluirAsync(int id, int usuarioLogadoId);
    Task<bool> AlterarSenhaAsync(int id, AlterarSenhaDto dto);
}
