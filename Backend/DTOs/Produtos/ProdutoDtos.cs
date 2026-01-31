using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Produtos;

public class CriarProdutoDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [MaxLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Categoria é obrigatória")]
    [MaxLength(50, ErrorMessage = "Categoria deve ter no máximo 50 caracteres")]
    public string Categoria { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Descrição deve ter no máximo 500 caracteres")]
    public string? Descricao { get; set; }

    [Required(ErrorMessage = "Preço é obrigatório")]
    [Range(0.01, 99999.99, ErrorMessage = "Preço deve ser entre 0.01 e 99999.99")]
    public decimal Preco { get; set; }

    public bool Ativo { get; set; } = true;
}

public class AtualizarProdutoDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [MaxLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Categoria é obrigatória")]
    [MaxLength(50, ErrorMessage = "Categoria deve ter no máximo 50 caracteres")]
    public string Categoria { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Descrição deve ter no máximo 500 caracteres")]
    public string? Descricao { get; set; }

    [Required(ErrorMessage = "Preço é obrigatório")]
    [Range(0.01, 99999.99, ErrorMessage = "Preço deve ser entre 0.01 e 99999.99")]
    public decimal Preco { get; set; }

    public bool Ativo { get; set; } = true;
}

public class ProdutoDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal Preco { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
}
