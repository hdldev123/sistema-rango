using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.Produtos;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ProdutoService : IProdutoService
{
    private readonly AppDbContext _context;

    public ProdutoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ResultadoPaginadoDto<ProdutoDto>> ObterTodosAsync(PaginacaoDto paginacao, string? categoria = null, bool? apenasAtivos = null)
    {
        var query = _context.Produtos.AsQueryable();

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            query = query.Where(p => p.Categoria == categoria);
        }

        if (apenasAtivos.HasValue)
        {
            query = query.Where(p => p.Ativo == apenasAtivos.Value);
        }

        var total = await query.CountAsync();

        var produtos = await query
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.Nome)
            .Skip((paginacao.Pagina - 1) * paginacao.TamanhoPagina)
            .Take(paginacao.TamanhoPagina)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return new ResultadoPaginadoDto<ProdutoDto>
        {
            Dados = produtos,
            PaginaAtual = paginacao.Pagina,
            TamanhoPagina = paginacao.TamanhoPagina,
            TotalItens = total,
            TotalPaginas = (int)Math.Ceiling(total / (double)paginacao.TamanhoPagina)
        };
    }

    public async Task<ProdutoDto?> ObterPorIdAsync(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);
        return produto == null ? null : MapToDto(produto);
    }

    public async Task<List<string>> ObterCategoriasAsync()
    {
        return await _context.Produtos
            .Select(p => p.Categoria)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }

    public async Task<ProdutoDto> CriarAsync(CriarProdutoDto dto)
    {
        var produto = new Produto
        {
            Nome = dto.Nome,
            Categoria = dto.Categoria,
            Descricao = dto.Descricao,
            Preco = dto.Preco,
            Ativo = dto.Ativo,
            DataCriacao = DateTime.UtcNow
        };

        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        return MapToDto(produto);
    }

    public async Task<ProdutoDto?> AtualizarAsync(int id, AtualizarProdutoDto dto)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null) return null;

        produto.Nome = dto.Nome;
        produto.Categoria = dto.Categoria;
        produto.Descricao = dto.Descricao;
        produto.Preco = dto.Preco;
        produto.Ativo = dto.Ativo;

        await _context.SaveChangesAsync();

        return MapToDto(produto);
    }

    public async Task<bool> ExcluirAsync(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null) return false;

        _context.Produtos.Remove(produto);
        await _context.SaveChangesAsync();

        return true;
    }

    private static ProdutoDto MapToDto(Produto produto) => new()
    {
        Id = produto.Id,
        Nome = produto.Nome,
        Categoria = produto.Categoria,
        Descricao = produto.Descricao,
        Preco = produto.Preco,
        Ativo = produto.Ativo,
        DataCriacao = produto.DataCriacao
    };
}
