using Backend.DTOs.Common;
using Backend.DTOs.Pedidos;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador,Atendente")]
public class PedidosController : ControllerBase
{
    private readonly IPedidoService _pedidoService;

    public PedidosController(IPedidoService pedidoService)
    {
        _pedidoService = pedidoService;
    }

    /// <summary>
    /// Lista todos os pedidos com paginação e filtros
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ResultadoPaginadoDto<PedidoResumoDto>>> ObterTodos(
        [FromQuery] PaginacaoDto paginacao,
        [FromQuery] StatusPedido? status = null,
        [FromQuery] DateTime? dataInicio = null,
        [FromQuery] DateTime? dataFim = null)
    {
        var resultado = await _pedidoService.ObterTodosAsync(paginacao, status, dataInicio, dataFim);
        return Ok(resultado);
    }

    /// <summary>
    /// Obtém um pedido por ID com detalhes
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PedidoDto>> ObterPorId(int id)
    {
        var pedido = await _pedidoService.ObterPorIdAsync(id);

        if (pedido == null)
            return NotFound(new { sucesso = false, mensagem = "Pedido não encontrado." });

        return Ok(pedido);
    }

    /// <summary>
    /// Cria um novo pedido (calcula valor total automaticamente usando preços do banco)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PedidoDto>> Criar([FromBody] CriarPedidoDto dto)
    {
        var (pedido, erros) = await _pedidoService.CriarAsync(dto);

        if (erros != null && erros.Any())
            return BadRequest(new { sucesso = false, mensagem = "Erro ao criar pedido.", erros });

        return CreatedAtAction(nameof(ObterPorId), new { id = pedido!.Id }, pedido);
    }

    /// <summary>
    /// Atualiza o status de um pedido
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<PedidoDto>> AtualizarStatus(int id, [FromBody] AtualizarStatusDto dto)
    {
        var pedido = await _pedidoService.AtualizarStatusAsync(id, dto);

        if (pedido == null)
            return NotFound(new { sucesso = false, mensagem = "Pedido não encontrado." });

        return Ok(pedido);
    }
}
