namespace Backend.Models;

public class ItemPedido
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitarioSnapshot { get; set; } // Preço salvo no momento da venda

    // Navigation
    public Pedido Pedido { get; set; } = null!;
    public Produto Produto { get; set; } = null!;
}
