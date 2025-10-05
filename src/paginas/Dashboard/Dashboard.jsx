import React from 'react';
import './Dashboard.css';
// Em um projeto real, você usaria hooks para buscar dados e estados de carregamento
// import { useKpis, useVendas } from '../../hooks/dashboardHooks';

// Mock dos dados para a UI
const kpisData = {
  pedidosHoje: 23,
  faturamentoMes: "R$ 31.850,75",
  novosClientesSemana: 8,
};

const vendasData = [
  { name: 'Jan', Vendas: 21000 },
  { name: 'Fev', Vendas: 25000 },
  { name: 'Mar', Vendas: 19000 },
  { name: 'Abr', Vendas: 29000 },
  { name: 'Mai', Vendas: 31850 },
  { name: 'Jun', Vendas: 28000 },
];

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


function Dashboard() {
  return (
    <div>
      <h1 className="titulo-pagina">Dashboard</h1>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3 className="kpi-titulo">Pedidos Hoje</h3>
          <p className="kpi-valor">{kpisData.pedidosHoje}</p>
        </div>
        <div className="kpi-card">
          <h3 className="kpi-titulo">Faturamento do Mês</h3>
          <p className="kpi-valor">{kpisData.faturamentoMes}</p>
        </div>
        <div className="kpi-card">
          <h3 className="kpi-titulo">Novos Clientes (Semana)</h3>
          <p className="kpi-valor">{kpisData.novosClientesSemana}</p>
        </div>
      </div>
      
      <div className="grafico-card">
        <h3 className='grafico-titulo'>Vendas nos Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={vendasData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Vendas" stroke="#0d47a1" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Dashboard;
