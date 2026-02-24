namespace Backend.DTOs.Common;

public class PaginacaoDto
{
    private int _pagina = 1;
    private int _tamanhoPagina = 10;

    public int Pagina
    {
        get => _pagina;
        set => _pagina = value < 1 ? 1 : value;
    }

    public int TamanhoPagina
    {
        get => _tamanhoPagina;
        set => _tamanhoPagina = value > 100 ? 100 : (value < 1 ? 10 : value);
    }
}

public class ResultadoPaginadoDto<T>
{
    public List<T> Dados { get; set; } = new();
    public int PaginaAtual { get; set; }
    public int TamanhoPagina { get; set; }
    public int TotalItens { get; set; }
    public int TotalPaginas { get; set; }
    public bool TemProxima => PaginaAtual < TotalPaginas;
    public bool TemAnterior => PaginaAtual > 1;
}

public class ApiResponse<T>
{
    public bool Sucesso { get; set; }
    public string? Mensagem { get; set; }
    public T? Dados { get; set; }
    public List<string>? Erros { get; set; }

    public static ApiResponse<T> Ok(T dados, string? mensagem = null) => new()
    {
        Sucesso = true,
        Dados = dados,
        Mensagem = mensagem
    };

    public static ApiResponse<T> Erro(string mensagem, List<string>? erros = null) => new()
    {
        Sucesso = false,
        Mensagem = mensagem,
        Erros = erros
    };
}
