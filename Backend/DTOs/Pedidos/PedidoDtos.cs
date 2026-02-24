using System.ComponentModel.DataAnnotations;
using Backend.Models.Enums;

namespace Backend.DTOs.Pedidos;

public class CriarPedidoDto
{
    [Required(ErrorMessage = "Cliente é obrigatório")]
    public int ClienteId { get; set; }

    public DateTime? DataEntrega { get; set; }

    [MaxLength(500, ErrorMessage = "Observações deve ter no máximo 500 caracteres")]
    public string? Observacoes { get; set; }

    [Required(ErrorMessage = "Itens são obrigatórios")]
    [MinLength(1, ErrorMessage = "Pedido deve ter pelo menos 1 item")]
    public List<ItemPedidoDto> Itens { get; set; } = new();
}

public class ItemPedidoDto
{
    [Required(ErrorMessage = "Produto é obrigatório")]
    public int ProdutoId { get; set; }

    [Required(ErrorMessage = "Quantidade é obrigatória")]
    [Range(1, 9999, ErrorMessage = "Quantidade deve ser entre 1 e 9999")]
    public int Quantidade { get; set; }
}

public class AtualizarStatusDto
{
    [Required(ErrorMessage = "Status é obrigatório")]
    public StatusPedido Status { get; set; }
}

public class PedidoDto
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string ClienteNome { get; set; } = string.Empty;
    public string? ClienteTelefone { get; set; }
    public string? ClienteEndereco { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? DataEntrega { get; set; }
    public decimal ValorTotal { get; set; }
    public string Status { get; set; } = string.Empty;
    public StatusPedido StatusEnum { get; set; }
    public string? Observacoes { get; set; }
    public List<ItemPedidoResponseDto> Itens { get; set; } = new();
}

public class ItemPedidoResponseDto
{
    public int Id { get; set; }
    public int ProdutoId { get; set; }
    public string ProdutoNome { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal Subtotal => Quantidade * PrecoUnitario;
}

public class PedidoResumoDto
{
    public int Id { get; set; }
    public string ClienteNome { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }
    public DateTime? DataEntrega { get; set; }
    public decimal ValorTotal { get; set; }
    public string Status { get; set; } = string.Empty;
    public StatusPedido StatusEnum { get; set; }
    public int QuantidadeItens { get; set; }
}
