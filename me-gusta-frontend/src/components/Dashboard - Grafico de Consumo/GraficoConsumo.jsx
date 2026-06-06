import { useState, useEffect, useRef } from 'react'
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import api from '../../provider/api'
import './GraficoConsumo.css'
 
Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend)
 
const CORES = ['#4a90d9', '#b47fd4', '#e8734a', '#4ab87a', '#e8c44a', '#d94a7a']
 
const PERIODOS = [
  { label: '7 dias',  valor: 7  },
  { label: '15 dias', valor: 15 },
  { label: '30 dias', valor: 30 },
]
 
export default function GraficoConsumo({ categorias = [] }) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas')
  const [periodo, setPeriodo] = useState(7)
  const [carregando, setCarregando] = useState(false)
  const [dadosGrafico, setDadosGrafico] = useState([])
 
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
 
  useEffect(() => {
    setCarregando(true)
 
    const requisicao = categoriaSelecionada === 'todas'
      ? api.post('/categoria-insumos/consumo/geral', { intervalo: periodo })
      : api.post('/categoria-insumos/consumo', { nomeCategoria: categoriaSelecionada, intervalo: periodo })
 
    requisicao
      .then((resposta) => {
        const dados = categoriaSelecionada === 'todas'
          ? resposta.data
          : [{ nomeCategoria: categoriaSelecionada, consumos: resposta.data }]
 
        setDadosGrafico(dados)
      })
      .catch((erro) => {
        console.error('Erro ao buscar consumo:', erro)
      })
      .finally(() => {
        setCarregando(false)
      })
  }, [categoriaSelecionada, periodo])
 
  // Só renderiza quando o canvas já está no DOM e os dados chegaram
  useEffect(() => {
    if (!dadosGrafico.length || !canvasRef.current) return
    renderizarGrafico(dadosGrafico)
  }, [dadosGrafico])
 
  // Atualiza automaticamente todo dia às 7h
  useEffect(() => {
    function calcularMsAteSeteDaManha() {
      const agora = new Date()
      const proximas7h = new Date()
      proximas7h.setHours(7, 0, 0, 0)
 
      if (agora >= proximas7h) {
        proximas7h.setDate(proximas7h.getDate() + 1)
      }
 
      return proximas7h - agora
    }
 
    function buscarDados() {
      setCarregando(true)
 
      const requisicao = categoriaSelecionada === 'todas'
        ? api.post('/categoria-insumos/consumo/geral', { intervalo: periodo })
        : api.post('/categoria-insumos/consumo', { nomeCategoria: categoriaSelecionada, intervalo: periodo })
 
      requisicao
        .then((resposta) => {
          const dados = categoriaSelecionada === 'todas'
            ? resposta.data
            : [{ nomeCategoria: categoriaSelecionada, consumos: resposta.data }]
 
          setDadosGrafico(dados)
        })
        .catch((erro) => {
          console.error('Erro ao buscar consumo:', erro)
        })
        .finally(() => {
          setCarregando(false)
        })
    }
 
    const timeoutId = setTimeout(() => {
      buscarDados()
      const intervaloId = setInterval(buscarDados, 24 * 60 * 60 * 1000)
      return () => clearInterval(intervaloId)
    }, calcularMsAteSeteDaManha())
 
    return () => clearTimeout(timeoutId)
  }, [categoriaSelecionada, periodo])
 
  function renderizarGrafico(dados) {
    chartRef.current?.destroy()
 
    const todasAsDatas = [...new Set(
      dados.flatMap(cat => cat.consumos.map(c => c.dtConsumo))
    )].sort()
 
    const datasets = dados.map((categoria, index) => {
      const cor = CORES[index % CORES.length]
 
      const pontos = todasAsDatas.map(data => {
        const consumoDoDia = categoria.consumos.find(c => c.dtConsumo === data)
        return consumoDoDia ? consumoDoDia.quantidade : 0
      })
 
      return {
        label: categoria.nomeCategoria,
        data: pontos,
        borderColor: cor,
        backgroundColor: cor,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: cor,
        tension: 0.35,
        fill: false,
      }
    })
 
    const labels = todasAsDatas.map(data => {
      const [, mes, dia] = data.split('-')
      return `${dia}/${mes}`
    })
 
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: categoriaSelecionada === 'todas' },
          tooltip: {
            backgroundColor: '#fff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            titleColor: '#333',
            bodyColor: '#555',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { color: '#ebebeb' },
            border: { display: false },
            ticks: { color: '#888', font: { size: 12 } },
          },
          y: {
            grid: { color: '#ebebeb' },
            border: { display: false },
            ticks: { color: '#888', font: { size: 12 } },
          },
        },
      },
    })
  }
 
  return (
    <div className="grafico-consumo">
      <div className="grafico-cabecalho">
        <span className="grafico-titulo">
          Consumo por categoria nos últimos {periodo} dias
        </span>
 
        <div className="grafico-filtro">
          <select
            className="select-filtro"
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
          >
            <option value="todas">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
 
          <select
            className="select-filtro"
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value))}
          >
            {PERIODOS.map((p) => (
              <option key={p.valor} value={p.valor}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>
 
      <div className="grafico-area">
        {carregando
          ? <span className="grafico-carregando">Carregando...</span>
          : <canvas ref={canvasRef} />
        }
      </div>
    </div>
  )
}