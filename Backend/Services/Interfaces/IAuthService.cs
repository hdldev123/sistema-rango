using Backend.DTOs.Auth;
using Backend.DTOs.Usuarios;

namespace Backend.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
    string HashSenha(string senha);
    bool VerificarSenha(string senha, string hash);
}
