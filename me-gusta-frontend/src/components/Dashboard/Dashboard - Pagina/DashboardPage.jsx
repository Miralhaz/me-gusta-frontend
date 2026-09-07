import { useState, useEffect } from 'react'
import api from '../../../provider/api'
import AlertasValidade       from '../Dashboard - Alertas de Validade/AlertasValidade'
import ReposicaoUrgente      from '../Dashboard - Reposicao Urgente/ReposicaoUrgente'
import GraficoConsumo        from '../Dashboard - Grafico de Consumo/GraficoConsumo'
import MovimentacoesRecentes from '../Dashboard - Movimentacoes Recentes/MovimentacoesRecentes'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import './DashboardPage.css'

export default function DashboardPage() {
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    api.get('/categoria-insumos')
      .then((res) => {
        setCategorias(Array.isArray(res.data) ? res.data : [])
      })
      .catch((e) => {
        if (e.response?.status !== 204) {
          console.error('Erro ao buscar categorias:', e)
        }
        setCategorias([])
      })
  }, [])

  return (
    <>
      <Navbar />
      <div className="pagina-dashboard">
        <div className="dashboard-linha-topo">
          <AlertasValidade />
          <ReposicaoUrgente />
        </div>

        <div className="dashboard-linha-baixo">
          <GraficoConsumo categorias={categorias} />
          <MovimentacoesRecentes />
        </div>
      </div>
    </>
  )
}