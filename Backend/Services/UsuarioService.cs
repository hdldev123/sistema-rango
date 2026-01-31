using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.Usuarios;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UsuarioService : IUsuarioService
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;

    public UsuarioService(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    public async Task<ResultadoPaginadoDto<UsuarioDto>> ObterTodosAsync(PaginacaoDto paginacao)
    {
        var query = _context.Usuarios.AsQueryable();

        var total = await query.CountAsync();

        var usuarios = await query
            .OrderByDescending(u => u.DataCriacao)
            .Skip((paginacao.Pagina - 1) * paginacao.TamanhoPagina)
            .Take(paginacao.TamanhoPagina)
            .Select(u => MapToDto(u))
            .ToListAsync();

        return new ResultadoPaginadoDto<UsuarioDto>
        {
            Dados = usuarios,
            PaginaAtual = paginacao.Pagina,
            TamanhoPagina = paginacao.TamanhoPagina,
            TotalItens = total,
            TotalPaginas = (int)Math.Ceiling(total / (double)paginacao.TamanhoPagina)
        };
    }

    public async Task<UsuarioDto?> ObterPorIdAsync(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        return usuario == null ? null : MapToDto(usuario);
    }

    public async Task<UsuarioDto> CriarAsync(CriarUsuarioDto dto)
    {
        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = _authService.HashSenha(dto.Senha),
            Perfil = dto.Perfil,
            DataCriacao = DateTime.UtcNow,
            Ativo = true
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return MapToDto(usuario);
    }

    public async Task<UsuarioDto?> AtualizarAsync(int id, AtualizarUsuarioDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return null;

        usuario.Nome = dto.Nome;
        usuario.Email = dto.Email;
        usuario.Perfil = dto.Perfil;
        usuario.Ativo = dto.Ativo;

        await _context.SaveChangesAsync();

        return MapToDto(usuario);
    }

    public async Task<bool> ExcluirAsync(int id, int usuarioLogadoId)
    {
        if (id == usuarioLogadoId)
            throw new InvalidOperationException("Você não pode excluir a si mesmo.");

        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return false;

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> AlterarSenhaAsync(int id, AlterarSenhaDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return false;

        if (!_authService.VerificarSenha(dto.SenhaAtual, usuario.SenhaHash))
            throw new InvalidOperationException("Senha atual incorreta.");

        usuario.SenhaHash = _authService.HashSenha(dto.NovaSenha);
        await _context.SaveChangesAsync();

        return true;
    }

    private static UsuarioDto MapToDto(Usuario usuario) => new()
    {
        Id = usuario.Id,
        Nome = usuario.Nome,
        Email = usuario.Email,
        Perfil = usuario.Perfil.ToString(),
        DataCriacao = usuario.DataCriacao,
        Ativo = usuario.Ativo
    };
}
