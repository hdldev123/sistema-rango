namespace Backend.DTOs.Dashboard;

public class DashboardKpisDto
{
    public decimal ReceitaTotal { get; set; }
    public int TotalPedidos { get; set; }
    public int TotalClientes { get; set; }
    public int PedidosPendentes { get; set; }
    public int PedidosHoje { get; set; }
    public decimal ReceitaHoje { get; set; }
}

public class PedidosPorMesDto
{
    public int Ano { get; set; }
    public int Mes { get; set; }
    public string MesNome { get; set; } = string.Empty;
    public int TotalPedidos { get; set; }
    public decimal ReceitaTotal { get; set; }
}

public class DistribuicaoStatusDto
{
    public string Status { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal Percentual { get; set; }
}

public class DashboardCompletoDto
{
    public DashboardKpisDto Kpis { get; set; } = new();
    public List<PedidosPorMesDto> PedidosPorMes { get; set; } = new();
    public List<DistribuicaoStatusDto> DistribuicaoStatus { get; set; } = new();
}
