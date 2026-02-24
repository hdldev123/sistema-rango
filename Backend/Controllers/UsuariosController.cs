using System.Security.Claims;
using Backend.DTOs.Common;
using Backend.DTOs.Usuarios;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    /// <summary>
    /// Lista todos os usuários com paginação
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ResultadoPaginadoDto<UsuarioDto>>> ObterTodos([FromQuery] PaginacaoDto paginacao)
    {
        var resultado = await _usuarioService.ObterTodosAsync(paginacao);
        return Ok(resultado);
    }

    /// <summary>
    /// Obtém um usuário por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioDto>> ObterPorId(int id)
    {
        var usuario = await _usuarioService.ObterPorIdAsync(id);

        if (usuario == null)
            return NotFound(new { sucesso = false, mensagem = "Usuário não encontrado." });

        return Ok(usuario);
    }

    /// <summary>
    /// Cria um novo usuário
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> Criar([FromBody] CriarUsuarioDto dto)
    {
        var usuario = await _usuarioService.CriarAsync(dto);
        return CreatedAtAction(nameof(ObterPorId), new { id = usuario.Id }, usuario);
    }

    /// <summary>
    /// Atualiza um usuário existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioDto>> Atualizar(int id, [FromBody] AtualizarUsuarioDto dto)
    {
        var usuario = await _usuarioService.AtualizarAsync(id, dto);

        if (usuario == null)
            return NotFound(new { sucesso = false, mensagem = "Usuário não encontrado." });

        return Ok(usuario);
    }

    /// <summary>
    /// Exclui um usuário
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var usuarioLogadoId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        try
        {
            var resultado = await _usuarioService.ExcluirAsync(id, usuarioLogadoId);

            if (!resultado)
                return NotFound(new { sucesso = false, mensagem = "Usuário não encontrado." });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { sucesso = false, mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Altera a senha de um usuário
    /// </summary>
    [HttpPatch("{id}/senha")]
    public async Task<IActionResult> AlterarSenha(int id, [FromBody] AlterarSenhaDto dto)
    {
        try
        {
            var resultado = await _usuarioService.AlterarSenhaAsync(id, dto);

            if (!resultado)
                return NotFound(new { sucesso = false, mensagem = "Usuário não encontrado." });

            return Ok(new { sucesso = true, mensagem = "Senha alterada com sucesso." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { sucesso = false, mensagem = ex.Message });
        }
    }
}
