using Backend.Models.Enums;

namespace Backend.Models;

public class Pedido
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime? DataEntrega { get; set; }
    public decimal ValorTotal { get; set; }
    public StatusPedido Status { get; set; } = StatusPedido.Pendente;
    public string? Observacoes { get; set; }

    // Navigation
    public Cliente Cliente { get; set; } = null!;
    public ICollection<ItemPedido> Itens { get; set; } = new List<ItemPedido>();
}
