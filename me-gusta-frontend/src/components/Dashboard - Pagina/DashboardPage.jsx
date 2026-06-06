import { useState, useEffect } from 'react'
import api from '../../provider/api'
import AlertasValidade       from '../Dashboard - Alertas de Validade/AlertasValidade'
import ReposicaoUrgente      from '../Dashboard - Reposicao Urgente/ReposicaoUrgente'
import GraficoConsumo        from '../Dashboard - Grafico de Consumo/GraficoConsumo'
import MovimentacoesRecentes from '../Dashboard - Movimentacoes Recentes/MovimentacoesRecentes'
import DashboardNavbar       from '../Dashboard - Navbar/DashboardNavbar'
import './DashboardPage.css'

export default function DashboardPage({ onNavigarLogin }) {

  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    api.get('/categoria-insumos')

    .then((res) => {
      setCategorias(res.data)
    })

    .catch((e) => {
      console.error('Erro ao buscar categorias:', erro)
    })

  }, [])

    function sair() {
    console.log("att chamado");
    document.cookie = 'token=; path=/; max-age=0'
    onNavigarLogin?.()
    }

  return (
    <>
    <DashboardNavbar onSair={sair} />
    <div className="pagina-dashboard">
      <div className="dashboard-linha-topo">
        <AlertasValidade />
        <ReposicaoUrgente />
      </div>

      <div className="dashboard-linha-baixo">
        <GraficoConsumo categorias={categorias}/>
        <MovimentacoesRecentes />
      </div>
    </div>
    </>
  )
}
