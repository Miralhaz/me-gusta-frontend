import AlertasValidade       from '../Dashboard - Alertas de Validade/AlertasValidade'
import ReposicaoUrgente      from '../Dashboard - Reposicao Urgente/ReposicaoUrgente'
import GraficoConsumo        from '../Dashboard - Grafico de Consumo/GraficoConsumo'
import MovimentacoesRecentes from '../Dashboard - Movimentacoes Recentes/MovimentacoesRecentes'
import DashboardNavbar from '../Dashboard - Navbar/DashboardNavbar'
import './DashboardPage.css'

export default function DashboardPage() {
  return (
    <>
    <DashboardNavbar />
    <div className="pagina-dashboard">
      <div className="dashboard-linha-topo">
        <AlertasValidade />
        <ReposicaoUrgente />
      </div>

      <div className="dashboard-linha-baixo">
        <GraficoConsumo />
        <MovimentacoesRecentes />
      </div>
    </div>
    </>
  )
}
