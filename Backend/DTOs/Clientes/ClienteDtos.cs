using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Clientes;

public class CriarClienteDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [MaxLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefone é obrigatório")]
    [MaxLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
    public string Telefone { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Email inválido")]
    [MaxLength(150, ErrorMessage = "Email deve ter no máximo 150 caracteres")]
    public string? Email { get; set; }

    [MaxLength(255, ErrorMessage = "Endereço deve ter no máximo 255 caracteres")]
    public string? Endereco { get; set; }

    [MaxLength(100, ErrorMessage = "Cidade deve ter no máximo 100 caracteres")]
    public string? Cidade { get; set; }

    [MaxLength(10, ErrorMessage = "CEP deve ter no máximo 10 caracteres")]
    public string? Cep { get; set; }
}

public class AtualizarClienteDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [MaxLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefone é obrigatório")]
    [MaxLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
    public string Telefone { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Email inválido")]
    [MaxLength(150, ErrorMessage = "Email deve ter no máximo 150 caracteres")]
    public string? Email { get; set; }

    [MaxLength(255, ErrorMessage = "Endereço deve ter no máximo 255 caracteres")]
    public string? Endereco { get; set; }

    [MaxLength(100, ErrorMessage = "Cidade deve ter no máximo 100 caracteres")]
    public string? Cidade { get; set; }

    [MaxLength(10, ErrorMessage = "CEP deve ter no máximo 10 caracteres")]
    public string? Cep { get; set; }
}

public class ClienteDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Endereco { get; set; }
    public string? Cidade { get; set; }
    public string? Cep { get; set; }
    public DateTime DataCriacao { get; set; }
    public int TotalPedidos { get; set; }
}
