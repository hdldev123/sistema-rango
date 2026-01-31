namespace Backend.Models;

public class Cliente
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Endereco { get; set; }
    public string? Cidade { get; set; }
    public string? Cep { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}
