using Backend.DTOs.Pedidos;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador,Entregador")]
public class EntregasController : ControllerBase
{
    private readonly IPedidoService _pedidoService;

    public EntregasController(IPedidoService pedidoService)
    {
        _pedidoService = pedidoService;
    }

    /// <summary>
    /// Obtém rotas de entrega para hoje (pedidos Prontos ou Em Entrega com data de entrega hoje)
    /// </summary>
    [HttpGet("rotas")]
    public async Task<ActionResult<List<PedidoDto>>> ObterRotasHoje()
    {
        var rotas = await _pedidoService.ObterRotasHojeAsync();
        return Ok(rotas);
    }
}
