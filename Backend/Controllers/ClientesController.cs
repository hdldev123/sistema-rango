using Backend.DTOs.Clientes;
using Backend.DTOs.Common;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador,Atendente")]
public class ClientesController : ControllerBase
{
    private readonly IClienteService _clienteService;

    public ClientesController(IClienteService clienteService)
    {
        _clienteService = clienteService;
    }

    /// <summary>
    /// Lista todos os clientes com paginação e busca
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ResultadoPaginadoDto<ClienteDto>>> ObterTodos(
        [FromQuery] PaginacaoDto paginacao,
        [FromQuery] string? busca = null)
    {
        var resultado = await _clienteService.ObterTodosAsync(paginacao, busca);
        return Ok(resultado);
    }

    /// <summary>
    /// Obtém um cliente por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ClienteDto>> ObterPorId(int id)
    {
        var cliente = await _clienteService.ObterPorIdAsync(id);

        if (cliente == null)
            return NotFound(new { sucesso = false, mensagem = "Cliente não encontrado." });

        return Ok(cliente);
    }

    /// <summary>
    /// Cria um novo cliente
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ClienteDto>> Criar([FromBody] CriarClienteDto dto)
    {
        var cliente = await _clienteService.CriarAsync(dto);
        return CreatedAtAction(nameof(ObterPorId), new { id = cliente.Id }, cliente);
    }

    /// <summary>
    /// Atualiza um cliente existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ClienteDto>> Atualizar(int id, [FromBody] AtualizarClienteDto dto)
    {
        var cliente = await _clienteService.AtualizarAsync(id, dto);

        if (cliente == null)
            return NotFound(new { sucesso = false, mensagem = "Cliente não encontrado." });

        return Ok(cliente);
    }

    /// <summary>
    /// Exclui um cliente (apenas se não tiver pedidos vinculados)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var (sucesso, mensagemErro) = await _clienteService.ExcluirAsync(id);

        if (!sucesso)
        {
            if (mensagemErro?.Contains("pedidos vinculados") == true)
                return Conflict(new { sucesso = false, mensagem = mensagemErro });

            return NotFound(new { sucesso = false, mensagem = mensagemErro });
        }

        return NoContent();
    }
}
