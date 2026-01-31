using Backend.Data;
using Backend.DTOs.Clientes;
using Backend.DTOs.Common;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ClienteService : IClienteService
{
    private readonly AppDbContext _context;

    public ClienteService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ResultadoPaginadoDto<ClienteDto>> ObterTodosAsync(PaginacaoDto paginacao, string? busca = null)
    {
        var query = _context.Clientes.Include(c => c.Pedidos).AsQueryable();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            busca = busca.ToLower();
            query = query.Where(c => 
                c.Nome.ToLower().Contains(busca) || 
                c.Telefone.Contains(busca) ||
                (c.Email != null && c.Email.ToLower().Contains(busca)));
        }

        var total = await query.CountAsync();

        var clientes = await query
            .OrderByDescending(c => c.DataCriacao)
            .Skip((paginacao.Pagina - 1) * paginacao.TamanhoPagina)
            .Take(paginacao.TamanhoPagina)
            .Select(c => new ClienteDto
            {
                Id = c.Id,
                Nome = c.Nome,
                Telefone = c.Telefone,
                Email = c.Email,
                Endereco = c.Endereco,
                Cidade = c.Cidade,
                Cep = c.Cep,
                DataCriacao = c.DataCriacao,
                TotalPedidos = c.Pedidos.Count
            })
            .ToListAsync();

        return new ResultadoPaginadoDto<ClienteDto>
        {
            Dados = clientes,
            PaginaAtual = paginacao.Pagina,
            TamanhoPagina = paginacao.TamanhoPagina,
            TotalItens = total,
            TotalPaginas = (int)Math.Ceiling(total / (double)paginacao.TamanhoPagina)
        };
    }

    public async Task<ClienteDto?> ObterPorIdAsync(int id)
    {
        var cliente = await _context.Clientes
            .Include(c => c.Pedidos)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cliente == null) return null;

        return new ClienteDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Telefone = cliente.Telefone,
            Email = cliente.Email,
            Endereco = cliente.Endereco,
            Cidade = cliente.Cidade,
            Cep = cliente.Cep,
            DataCriacao = cliente.DataCriacao,
            TotalPedidos = cliente.Pedidos.Count
        };
    }

    public async Task<ClienteDto> CriarAsync(CriarClienteDto dto)
    {
        var cliente = new Cliente
        {
            Nome = dto.Nome,
            Telefone = dto.Telefone,
            Email = dto.Email,
            Endereco = dto.Endereco,
            Cidade = dto.Cidade,
            Cep = dto.Cep,
            DataCriacao = DateTime.UtcNow
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        return new ClienteDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Telefone = cliente.Telefone,
            Email = cliente.Email,
            Endereco = cliente.Endereco,
            Cidade = cliente.Cidade,
            Cep = cliente.Cep,
            DataCriacao = cliente.DataCriacao,
            TotalPedidos = 0
        };
    }

    public async Task<ClienteDto?> AtualizarAsync(int id, AtualizarClienteDto dto)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null) return null;

        cliente.Nome = dto.Nome;
        cliente.Telefone = dto.Telefone;
        cliente.Email = dto.Email;
        cliente.Endereco = dto.Endereco;
        cliente.Cidade = dto.Cidade;
        cliente.Cep = dto.Cep;

        await _context.SaveChangesAsync();

        return await ObterPorIdAsync(id);
    }

    public async Task<(bool sucesso, string? mensagemErro)> ExcluirAsync(int id)
    {
        var cliente = await _context.Clientes
            .Include(c => c.Pedidos)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cliente == null)
            return (false, "Cliente não encontrado.");

        if (cliente.Pedidos.Any())
            return (false, "Não é possível excluir o cliente pois existem pedidos vinculados.");

        _context.Clientes.Remove(cliente);
        await _context.SaveChangesAsync();

        return (true, null);
    }
}
