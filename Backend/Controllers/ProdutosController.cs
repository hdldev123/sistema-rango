using Backend.DTOs.Common;
using Backend.DTOs.Produtos;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProdutosController : ControllerBase
{
    private readonly IProdutoService _produtoService;

    public ProdutosController(IProdutoService produtoService)
    {
        _produtoService = produtoService;
    }

    /// <summary>
    /// Lista todos os produtos com paginação e filtros
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ResultadoPaginadoDto<ProdutoDto>>> ObterTodos(
        [FromQuery] PaginacaoDto paginacao,
        [FromQuery] string? categoria = null,
        [FromQuery] bool? apenasAtivos = null)
    {
        var resultado = await _produtoService.ObterTodosAsync(paginacao, categoria, apenasAtivos);
        return Ok(resultado);
    }

    /// <summary>
    /// Obtém um produto por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProdutoDto>> ObterPorId(int id)
    {
        var produto = await _produtoService.ObterPorIdAsync(id);

        if (produto == null)
            return NotFound(new { sucesso = false, mensagem = "Produto não encontrado." });

        return Ok(produto);
    }

    /// <summary>
    /// Lista todas as categorias de produtos
    /// </summary>
    [HttpGet("categorias")]
    public async Task<ActionResult<List<string>>> ObterCategorias()
    {
        var categorias = await _produtoService.ObterCategoriasAsync();
        return Ok(categorias);
    }

    /// <summary>
    /// Cria um novo produto
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<ProdutoDto>> Criar([FromBody] CriarProdutoDto dto)
    {
        var produto = await _produtoService.CriarAsync(dto);
        return CreatedAtAction(nameof(ObterPorId), new { id = produto.Id }, produto);
    }

    /// <summary>
    /// Atualiza um produto existente
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<ProdutoDto>> Atualizar(int id, [FromBody] AtualizarProdutoDto dto)
    {
        var produto = await _produtoService.AtualizarAsync(id, dto);

        if (produto == null)
            return NotFound(new { sucesso = false, mensagem = "Produto não encontrado." });

        return Ok(produto);
    }

    /// <summary>
    /// Exclui um produto
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Excluir(int id)
    {
        var resultado = await _produtoService.ExcluirAsync(id);

        if (!resultado)
            return NotFound(new { sucesso = false, mensagem = "Produto não encontrado." });

        return NoContent();
    }
}
