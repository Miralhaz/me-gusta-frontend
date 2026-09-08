import { useState, useEffect, useRef, useCallback } from 'react'
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import api from '../../../provider/api'
import './GraficoConsumo.css'

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend)

const CORES = ['#4a90d9', '#b47fd4', '#e8734a', '#4ab87a', '#e8c44a', '#d94a7a']

const ICONE_CALENDARIO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export default function GraficoConsumo({ categorias = [] }) {
  const cats = Array.isArray(categorias) ? categorias : []
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [dadosGrafico, setDadosGrafico] = useState([])

  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  function temDados(dados) {
    return dados.length > 0 && dados.some(cat => cat.consumos && cat.consumos.length > 0)
  }

  const getHoje = () => new Date().toISOString().split('T')[0]
  const getSeteDiasAtras = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const calcularIntervalo = (inicio, fim) => {
    const diffTime = new Date(fim).getTime() - new Date(inicio).getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const buscarConsumo = async (inicio, fim) => {
    setCarregando(true)
    try {
      const intervalo = calcularIntervalo(inicio, fim)
      const requisicao = categoriaSelecionada === 'todas'
        ? api.post('/categoria-insumos/consumo/geral', { intervalo })
        : api.post('/categoria-insumos/consumo', { nomeCategoria: categoriaSelecionada, intervalo })

      const resposta = await requisicao
      const dados = categoriaSelecionada === 'todas'
        ? resposta.data
        : [{ nomeCategoria: categoriaSelecionada, consumos: resposta.data }]

      setDadosGrafico(dados)
    } catch (erro) {
      console.error('Erro ao buscar consumo:', erro)
      setDadosGrafico([])
    } finally {
      setCarregando(false)
    }
  }

  const buscarDadosAutoRefresh = () => {
    if (!dataInicio || !dataFim) return
    const intervalo = calcularIntervalo(dataInicio, dataFim)
    const requisicao = categoriaSelecionada === 'todas'
      ? api.post('/categoria-insumos/consumo/geral', { intervalo })
      : api.post('/categoria-insumos/consumo', { nomeCategoria: categoriaSelecionada, intervalo })

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

  useEffect(() => {
    const hoje = getHoje()
    const seteDiasAtras = getSeteDiasAtras()
    setDataInicio(seteDiasAtras)
    setDataFim(hoje)
    buscarConsumo(seteDiasAtras, hoje)
  }, [])

  const formatarDataParaExibicao = (dataISO) => {
    if (!dataISO) return ''
    const [ano, mes, dia] = dataISO.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const getPeriodoTexto = () => {
    if (!dataInicio || !dataFim) return ''
    const inicio = formatarDataParaExibicao(dataInicio)
    const fim = formatarDataParaExibicao(dataFim)
    if (inicio === fim) return inicio
    return `${inicio} - ${fim}`
  }

  const renderizarGrafico = useCallback((dados) => {
    if (!canvasRef.current || !temDados(dados)) return

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
  }, [categoriaSelecionada])

  const handleAplicarFiltro = () => {
    if (!dataInicio || !dataFim) return
    if (new Date(dataInicio) > new Date(dataFim)) {
      alert('Data inicial não pode ser maior que data final')
      return
    }
    buscarConsumo(dataInicio, dataFim)
  }

  useEffect(() => {
    if (!canvasRef.current) return
    if (temDados(dadosGrafico)) {
      renderizarGrafico(dadosGrafico)
    } else {
      chartRef.current?.destroy()
    }
  }, [dadosGrafico, renderizarGrafico])

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

    const timeoutId = setTimeout(() => {
      buscarDadosAutoRefresh()
      const intervaloId = setInterval(buscarDadosAutoRefresh, 24 * 60 * 60 * 1000)
      return () => clearInterval(intervaloId)
    }, calcularMsAteSeteDaManha())

    return () => clearTimeout(timeoutId)
  }, [categoriaSelecionada, dataInicio, dataFim])

  return (
    <div className="grafico-consumo">
      <div className="grafico-cabecalho">
        <span className="grafico-titulo">
          Consumo por categoria {getPeriodoTexto() ? `(${getPeriodoTexto()})` : ''}
        </span>

        <div className="grafico-filtro">
          <select
            className="select-filtro"
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
          >
            <option value="todas">Todas</option>
            {cats.map((cat) => (
              <option key={cat.id} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>

          <div className="filtro-datas">
            <label htmlFor="grafico-data-inicio" className="filtro-label">
              {ICONE_CALENDARIO}
              <span>Início</span>
            </label>
            <input
              type="date"
              id="grafico-data-inicio"
              className="input-data"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              max={dataFim || getHoje()}
            />
          </div>

          <div className="filtro-datas">
            <label htmlFor="grafico-data-fim" className="filtro-label">
              {ICONE_CALENDARIO}
              <span>Fim</span>
            </label>
            <input
              type="date"
              id="grafico-data-fim"
              className="input-data"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              min={dataInicio}
              max={getHoje()}
            />
          </div>

          <button
            className="btn-aplicar-filtro"
            onClick={handleAplicarFiltro}
            disabled={carregando || !dataInicio || !dataFim}
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className="grafico-area">
        {carregando
          ? <span className="grafico-carregando">Carregando...</span>
          : temDados(dadosGrafico)
            ? <canvas ref={canvasRef} />
            : <span className="grafico-vazio">Sem dados de consumo para exibir</span>
        }
      </div>
    </div>
  )
}