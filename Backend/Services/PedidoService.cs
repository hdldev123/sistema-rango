using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.Pedidos;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class PedidoService : IPedidoService
{
    private readonly AppDbContext _context;

    public PedidoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ResultadoPaginadoDto<PedidoResumoDto>> ObterTodosAsync(
        PaginacaoDto paginacao, 
        StatusPedido? status = null, 
        DateTime? dataInicio = null, 
        DateTime? dataFim = null)
    {
        var query = _context.Pedidos
            .Include(p => p.Cliente)
            .Include(p => p.Itens)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        if (dataInicio.HasValue)
        {
            query = query.Where(p => p.DataCriacao >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(p => p.DataCriacao <= dataFim.Value);
        }

        var total = await query.CountAsync();

        var pedidos = await query
            .OrderByDescending(p => p.DataCriacao)
            .Skip((paginacao.Pagina - 1) * paginacao.TamanhoPagina)
            .Take(paginacao.TamanhoPagina)
            .Select(p => new PedidoResumoDto
            {
                Id = p.Id,
                ClienteNome = p.Cliente.Nome,
                DataCriacao = p.DataCriacao,
                DataEntrega = p.DataEntrega,
                ValorTotal = p.ValorTotal,
                Status = FormatarStatus(p.Status),
                StatusEnum = p.Status,
                QuantidadeItens = p.Itens.Sum(i => i.Quantidade)
            })
            .ToListAsync();

        return new ResultadoPaginadoDto<PedidoResumoDto>
        {
            Dados = pedidos,
            PaginaAtual = paginacao.Pagina,
            TamanhoPagina = paginacao.TamanhoPagina,
            TotalItens = total,
            TotalPaginas = (int)Math.Ceiling(total / (double)paginacao.TamanhoPagina)
        };
    }

    public async Task<PedidoDto?> ObterPorIdAsync(int id)
    {
        var pedido = await _context.Pedidos
            .Include(p => p.Cliente)
            .Include(p => p.Itens)
                .ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pedido == null) return null;

        return MapToDto(pedido);
    }

    public async Task<(PedidoDto? pedido, List<string>? erros)> CriarAsync(CriarPedidoDto dto)
    {
        var erros = new List<string>();

        // Validar cliente
        var cliente = await _context.Clientes.FindAsync(dto.ClienteId);
        if (cliente == null)
        {
            erros.Add("Cliente não encontrado.");
            return (null, erros);
        }

        // Buscar produtos e validar
        var produtoIds = dto.Itens.Select(i => i.ProdutoId).ToList();
        var produtos = await _context.Produtos
            .Where(p => produtoIds.Contains(p.Id))
            .ToListAsync();

        // Verificar produtos inexistentes
        var produtosNaoEncontrados = produtoIds.Except(produtos.Select(p => p.Id)).ToList();
        if (produtosNaoEncontrados.Any())
        {
            erros.Add($"Produtos não encontrados: {string.Join(", ", produtosNaoEncontrados)}");
        }

        // Verificar produtos inativos
        var produtosInativos = produtos.Where(p => !p.Ativo).Select(p => p.Nome).ToList();
        if (produtosInativos.Any())
        {
            erros.Add($"Produtos inativos não podem ser adicionados: {string.Join(", ", produtosInativos)}");
        }

        if (erros.Any())
        {
            return (null, erros);
        }

        // REGRA CRÍTICA: Calcular valor total usando preços do banco
        var itens = new List<ItemPedido>();
        decimal valorTotal = 0;

        foreach (var itemDto in dto.Itens)
        {
            var produto = produtos.First(p => p.Id == itemDto.ProdutoId);
            var subtotal = produto.Preco * itemDto.Quantidade;
            valorTotal += subtotal;

            itens.Add(new ItemPedido
            {
                ProdutoId = itemDto.ProdutoId,
                Quantidade = itemDto.Quantidade,
                PrecoUnitarioSnapshot = produto.Preco // Salva o preço no momento da venda
            });
        }

        var pedido = new Pedido
        {
            ClienteId = dto.ClienteId,
            DataCriacao = DateTime.UtcNow,
            DataEntrega = dto.DataEntrega,
            ValorTotal = valorTotal,
            Status = StatusPedido.Pendente,
            Observacoes = dto.Observacoes,
            Itens = itens
        };

        _context.Pedidos.Add(pedido);
        await _context.SaveChangesAsync();

        // Recarregar com includes para retorno
        var pedidoCriado = await ObterPorIdAsync(pedido.Id);
        return (pedidoCriado, null);
    }

    public async Task<PedidoDto?> AtualizarStatusAsync(int id, AtualizarStatusDto dto)
    {
        var pedido = await _context.Pedidos.FindAsync(id);
        if (pedido == null) return null;

        pedido.Status = dto.Status;
        
        // Se status for Entregue, registrar data de entrega
        if (dto.Status == StatusPedido.Entregue && !pedido.DataEntrega.HasValue)
        {
            pedido.DataEntrega = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return await ObterPorIdAsync(id);
    }

    public async Task<List<PedidoDto>> ObterRotasHojeAsync()
    {
        var hoje = DateTime.UtcNow.Date;
        var amanha = hoje.AddDays(1);

        var pedidos = await _context.Pedidos
            .Include(p => p.Cliente)
            .Include(p => p.Itens)
                .ThenInclude(i => i.Produto)
            .Where(p => 
                (p.Status == StatusPedido.Pronto || p.Status == StatusPedido.EmEntrega) &&
                p.DataEntrega.HasValue &&
                p.DataEntrega.Value >= hoje &&
                p.DataEntrega.Value < amanha)
            .OrderBy(p => p.DataEntrega)
            .ToListAsync();

        return pedidos.Select(MapToDto).ToList();
    }

    private static PedidoDto MapToDto(Pedido pedido) => new()
    {
        Id = pedido.Id,
        ClienteId = pedido.ClienteId,
        ClienteNome = pedido.Cliente.Nome,
        ClienteTelefone = pedido.Cliente.Telefone,
        ClienteEndereco = pedido.Cliente.Endereco,
        DataCriacao = pedido.DataCriacao,
        DataEntrega = pedido.DataEntrega,
        ValorTotal = pedido.ValorTotal,
        Status = FormatarStatus(pedido.Status),
        StatusEnum = pedido.Status,
        Observacoes = pedido.Observacoes,
        Itens = pedido.Itens.Select(i => new ItemPedidoResponseDto
        {
            Id = i.Id,
            ProdutoId = i.ProdutoId,
            ProdutoNome = i.Produto.Nome,
            Quantidade = i.Quantidade,
            PrecoUnitario = i.PrecoUnitarioSnapshot
        }).ToList()
    };

    private static string FormatarStatus(StatusPedido status) => status switch
    {
        StatusPedido.Pendente => "Pendente",
        StatusPedido.EmProducao => "Em Produção",
        StatusPedido.Pronto => "Pronto",
        StatusPedido.EmEntrega => "Em Entrega",
        StatusPedido.Entregue => "Entregue",
        StatusPedido.Cancelado => "Cancelado",
        _ => status.ToString()
    };
}
