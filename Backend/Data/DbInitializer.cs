using Backend.Data;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context, IAuthService authService)
    {
        // Verificar se já existe dados
        if (await context.Usuarios.AnyAsync())
            return;

        // Criar usuário administrador padrão
        var admin = new Usuario
        {
            Nome = "Administrador",
            Email = "admin@xsalgados.com",
            SenhaHash = authService.HashSenha("admin123"),
            Perfil = PerfilUsuario.Administrador,
            DataCriacao = DateTime.UtcNow,
            Ativo = true
        };

        var atendente = new Usuario
        {
            Nome = "Atendente",
            Email = "atendente@xsalgados.com",
            SenhaHash = authService.HashSenha("atendente123"),
            Perfil = PerfilUsuario.Atendente,
            DataCriacao = DateTime.UtcNow,
            Ativo = true
        };

        var entregador = new Usuario
        {
            Nome = "Entregador",
            Email = "entregador@xsalgados.com",
            SenhaHash = authService.HashSenha("entregador123"),
            Perfil = PerfilUsuario.Entregador,
            DataCriacao = DateTime.UtcNow,
            Ativo = true
        };

        context.Usuarios.AddRange(admin, atendente, entregador);

        // Produtos de exemplo
        var produtos = new List<Produto>
        {
            new() { Nome = "X-Salada", Categoria = "Lanches", Preco = 15.00m, Ativo = true, Descricao = "Pão, hambúrguer, queijo, salada" },
            new() { Nome = "X-Bacon", Categoria = "Lanches", Preco = 18.00m, Ativo = true, Descricao = "Pão, hambúrguer, queijo, bacon" },
            new() { Nome = "X-Tudo", Categoria = "Lanches", Preco = 22.00m, Ativo = true, Descricao = "Pão, hambúrguer, queijo, bacon, ovo, salada" },
            new() { Nome = "Coxinha", Categoria = "Salgados", Preco = 6.00m, Ativo = true, Descricao = "Coxinha de frango" },
            new() { Nome = "Esfiha", Categoria = "Salgados", Preco = 5.50m, Ativo = true, Descricao = "Esfiha de carne" },
            new() { Nome = "Pastel de Carne", Categoria = "Salgados", Preco = 7.00m, Ativo = true, Descricao = "Pastel frito de carne" },
            new() { Nome = "Refrigerante Lata", Categoria = "Bebidas", Preco = 5.00m, Ativo = true, Descricao = "Refrigerante 350ml" },
            new() { Nome = "Suco Natural", Categoria = "Bebidas", Preco = 8.00m, Ativo = true, Descricao = "Suco natural de laranja 300ml" },
            new() { Nome = "Água Mineral", Categoria = "Bebidas", Preco = 3.00m, Ativo = true, Descricao = "Água mineral 500ml" },
        };

        context.Produtos.AddRange(produtos);

        // Clientes de exemplo
        var clientes = new List<Cliente>
        {
            new() { Nome = "João Silva", Telefone = "(11) 99999-1111", Email = "joao@email.com", Endereco = "Rua A, 123", Cidade = "São Paulo", Cep = "01234-567" },
            new() { Nome = "Maria Santos", Telefone = "(11) 99999-2222", Email = "maria@email.com", Endereco = "Rua B, 456", Cidade = "São Paulo", Cep = "01234-568" },
            new() { Nome = "Pedro Oliveira", Telefone = "(11) 99999-3333", Endereco = "Rua C, 789", Cidade = "São Paulo", Cep = "01234-569" },
        };

        context.Clientes.AddRange(clientes);

        await context.SaveChangesAsync();
    }
}
