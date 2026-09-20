import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import api from '../../../provider/api'
import './GraficoConsumo.css'

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend, annotationPlugin)

const CORES_RISCO = {
  CRITICO: '#d62828',
  ATENCAO: '#f77f00',
  ALERTA: '#fcbf49',
  OK: '#2a9d8f',
  SEM_CONSUMO: '#888'
}

const MAX_DIAS_EXIBICAO = 60
const MAX_ITENS_EXIBICAO = 20
const STORAGE_KEY = 'grafico-ruptura-filtro'

function getFiltroSalvo() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.dataInicio && parsed.dataFim) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return null
}

function salvarFiltro(inicio, fim) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dataInicio: inicio, dataFim: fim }))
  } catch (e) {
    console.warn('Não foi possível salvar filtro:', e)
  }
}

const ICONE_CALENDARIO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const ICONE_BUSCA = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)

export default function GraficoConsumo() {
  const filtroSalvo = getFiltroSalvo()
  const hoje = new Date().toISOString().split('T')[0]
  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const dataInicioPadrao = filtroSalvo?.dataInicio ?? seteDiasAtras
  const dataFimPadrao = filtroSalvo?.dataFim ?? hoje

  const [dataInicio, setDataInicio] = useState(dataInicioPadrao)
  const [dataFim, setDataFim] = useState(dataFimPadrao)
  const [carregando, setCarregando] = useState(false)
  const [dadosGrafico, setDadosGrafico] = useState([])
  const [erro, setErro] = useState(null)
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [buscaNome, setBuscaNome] = useState('')

  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const getHoje = () => new Date().toISOString().split('T')[0]
  const calcularIntervalo = (inicio, fim) => {
    const diffTime = new Date(fim).getTime() - new Date(inicio).getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

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

  const calcularDataRuptura = useCallback((diasDeCobertura) => {
    if (diasDeCobertura == null || diasDeCobertura < 0 || diasDeCobertura >= 999) return null
    const data = new Date()
    data.setDate(data.getDate() + Math.ceil(diasDeCobertura))
    return formatarDataParaExibicao(data.toISOString().split('T')[0])
  }, [])

  const buscarPrevisaoRuptura = useCallback(async (inicio, fim) => {
    setCarregando(true)
    setErro(null)
    try {
      const intervalo = calcularIntervalo(inicio, fim)
      const dataInicioISO = `${inicio}T00:00:00`
      const dataFimISO = `${fim}T23:59:59`
      const resposta = await api.get('/insumos/previsao-ruptura', {
        params: { dataInicio: dataInicioISO, dataFim: dataFimISO, intervaloDias: intervalo }
      })
      setDadosGrafico(resposta.data || [])
    } catch (e) {
      if (e.response?.status !== 204) {
        console.error('Erro ao buscar previsão de ruptura:', e)
        setErro('Erro ao carregar previsão de ruptura')
      }
      setDadosGrafico([])
    } finally {
      setCarregando(false)
    }
  }, [])

  const inicializadoRef = useRef(false)

  useEffect(() => {
    if (!inicializadoRef.current) {
      inicializadoRef.current = true
      buscarPrevisaoRuptura(dataInicio, dataFim)
    }
  }, [])

  const formatarNumero = (num) => {
    if (num === undefined || num === null) return '0'
    return Number(num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatarInteiro = (num) => {
    if (num === undefined || num === null) return '0'
    const n = Number(num)
    if (Number.isInteger(n)) {
      return n.toLocaleString('pt-BR')
    }
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getCorRisco = (nivel) => {
    const normalizado = nivel?.replace('Ç', 'C').replace('Ã', 'A').replace(' ', '_').toUpperCase()
    if (normalizado === 'CRITICO') return '#c0392b'
    if (normalizado === 'ATENCAO') return '#e67e22'
    return '#888'
  }

  const calcularNivelRisco = (dias, consumoMedio) => {
    if (dias == null || dias < 0 || dias >= 999) return 'SEM_CONSUMO'
    if (consumoMedio == null || consumoMedio <= 0) return 'SEM_CONSUMO'
    if (dias <= 2) return 'CRITICO'
    if (dias <= 5) return 'ATENCAO'
    if (dias <= 10) return 'ALERTA'
    return 'OK'
  }

  const getRiscoLabel = (nivel) => {
    const normalizado = nivel?.replace('Ç', 'C').replace('Ã', 'A').replace(' ', '_').toUpperCase()
    if (normalizado === 'CRITICO') return 'CRÍTICO'
    if (normalizado === 'ATENCAO') return 'ATENÇÃO'
    if (normalizado === 'ALERTA') return 'ALERTA'
    if (normalizado === 'OK') return 'OK'
    return 'SEM CONSUMO'
  }

  const getSugestaoIcone = (nivel) => {
    const normalizado = nivel?.replace('Ç', 'C').replace('Ã', 'A').replace(' ', '_').toUpperCase()
    if (normalizado === 'CRITICO') return '⚠'
    if (normalizado === 'ATENCAO') return '⚡'
    return 'ℹ'
  }

  const getSugestaoMensagem = (item, nivelCalculado) => {
    const normalizado = nivelCalculado?.replace('Ç', 'C').replace('Ã', 'A').replace(' ', '_').toUpperCase()
    const nome = item.nomeInsumo
    const dias = item.diasDeCobertura
    const qtdAtual = formatarInteiro(item.quantidadeAtual)
    const consumoMedio = formatarInteiro(item.consumoMedioDiario)
    const unidade = item.unidadeMedida

    if (normalizado === 'CRITICO') {
      return `AÇÃO IMEDIATA NECESSÁRIA: O insumo "${nome}" tem apenas ${dias} dia(s) de cobertura (${qtdAtual} ${unidade} em estoque). O consumo médio é de ${consumoMedio} ${unidade}/dia. Faça o pedido de reposição AGORA para evitar ruptura total. Considere solicitar compra emergencial ou transferência de outra unidade.`
    }
    if (normalizado === 'ATENCAO') {
      return `Fique atento à quantidade de "${nome}" no estoque. Com ${dias} dias de cobertura (${qtdAtual} ${unidade} disponíveis) e consumo médio de ${consumoMedio} ${unidade}/dia, o insumo está próximo de atingir nível crítico. Programe a reposição nos próximos dias para evitar urgência.`
    }
    if (normalizado === 'ALERTA') {
      return `O insumo "${nome}" tem ${dias} dias de cobertura (${qtdAtual} ${unidade}). O consumo está estável em ${consumoMedio} ${unidade}/dia. Monitore a evolução e prepare o pedido de reposição para a próxima semana.`
    }
    if (normalizado === 'OK') {
      return `O insumo "${nome}" está com estoque adequado (${dias} dias de cobertura, ${qtdAtual} ${unidade}). Consumo médio de ${consumoMedio} ${unidade}/dia. Continue monitorando periodicamente.`
    }
    return `O insumo "${nome}" não possui consumo registrado (${qtdAtual} ${unidade} em estoque). Não é possível calcular previsão de ruptura.`
  }

  const dadosFiltrados = useMemo(() => {
    let dados = [...dadosGrafico]
      .filter(d => d.diasDeCobertura != null && d.diasDeCobertura >= 0 && d.diasDeCobertura < 999 && d.consumoMedioDiario != null && d.consumoMedioDiario > 0)
    if (buscaNome.trim()) {
      const termo = buscaNome.trim().toLowerCase()
      dados = dados.filter(d => d.nomeInsumo?.toLowerCase().includes(termo))
    }
    dados.sort((a, b) => a.diasDeCobertura - b.diasDeCobertura)
    return dados
  }, [dadosGrafico, buscaNome])

  const dadosParaExibicao = useMemo(() => {
    let dados = dadosFiltrados
    if (!mostrarTodos && dados.length > MAX_ITENS_EXIBICAO) {
      dados = dados.slice(0, MAX_ITENS_EXIBICAO)
    }
    return dados
  }, [dadosFiltrados, mostrarTodos])

  const alturaCanvas = Math.max(300, dadosParaExibicao.length * 32 + 80)

  const renderizarGrafico = useCallback((dados) => {
    if (!canvasRef.current || !dados.length) return

    chartRef.current?.destroy()

    const labels = dados.map(d => {
      const dias = d.diasDeCobertura
      if (dias > MAX_DIAS_EXIBICAO) {
        return `${d.nomeInsumo} (${dias}d+)`
      }
      return d.nomeInsumo
    })
    const data = dados.map(d => Math.min(d.diasDeCobertura, MAX_DIAS_EXIBICAO))
    const niveisCalculados = dados.map(d => calcularNivelRisco(d.diasDeCobertura, d.consumoMedioDiario))
    const backgroundColors = dados.map((d, i) => CORES_RISCO[niveisCalculados[i]] || '#888')
    const borderColors = dados.map((d, i) => CORES_RISCO[niveisCalculados[i]] || '#888')
    const originais = dados.map(d => d.diasDeCobertura)

    const annotations = {
      critico: {
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: 2,
        borderColor: '#d62828',
        borderDash: [4, 4],
        borderWidth: 1.5,
        label: {
          enabled: true,
          content: 'Crítico (2d)',
          position: 'start',
          backgroundColor: '#d62828',
          color: '#fff',
          font: { size: 10, weight: 'bold' },
          padding: { x: 6, y: 2 },
          cornerRadius: 3
        }
      },
      atencao: {
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: 5,
        borderColor: '#f77f00',
        borderDash: [4, 4],
        borderWidth: 1.5,
        label: {
          enabled: true,
          content: 'Atenção (5d)',
          position: 'start',
          backgroundColor: '#f77f00',
          color: '#fff',
          font: { size: 10, weight: 'bold' },
          padding: { x: 6, y: 2 },
          cornerRadius: 3
        }
      },
      alerta: {
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: 10,
        borderColor: '#fcbf49',
        borderDash: [4, 4],
        borderWidth: 1.5,
        label: {
          enabled: true,
          content: 'Alerta (10d)',
          position: 'start',
          backgroundColor: '#fcbf49',
          color: '#333',
          font: { size: 10, weight: 'bold' },
          padding: { x: 6, y: 2 },
          cornerRadius: 3
        }
      }
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Dias de cobertura',
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          annotation: { annotations },
          tooltip: {
            backgroundColor: '#fff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            titleColor: '#333',
            bodyColor: '#555',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (context) => {
                const item = dados[context[0].dataIndex]
                return item.nomeInsumo
              },
              label: (context) => {
                const item = dados[context.dataIndex]
                const diasOriginais = originais[context.dataIndex]
                const nivelCalc = niveisCalculados[context.dataIndex]
                const dataRuptura = calcularDataRuptura(diasOriginais)
                const truncado = diasOriginais > MAX_DIAS_EXIBICAO ? ' (truncado no gráfico)' : ''
                const linhas = [
                  `Dias de cobertura: ${diasOriginais}${truncado}`,
                  `Qtd. atual: ${formatarNumero(item.quantidadeAtual)} ${item.unidadeMedida}`,
                  `Consumo médio/dia: ${formatarNumero(item.consumoMedioDiario)} ${item.unidadeMedida}`,
                  `Estoque mínimo: ${formatarNumero(item.estoqueMinimo)} ${item.unidadeMedida}`,
                  `Nível de risco: ${getRiscoLabel(nivelCalc)}`
                ]
                if (dataRuptura) {
                  linhas.push(`Ruptura prevista: ${dataRuptura}`)
                }
                return linhas
              }
            }
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index
            setItemSelecionado(dados[index])
          }
        },
        scales: {
            x: {
              beginAtZero: true,
              max: MAX_DIAS_EXIBICAO,
              grid: { color: '#ebebeb' },
              border: { display: false },
              ticks: { 
                color: '#888', 
                font: { size: 11 },
                callback: (value) => value === MAX_DIAS_EXIBICAO ? `${value}+` : value
              },
              title: {
                display: true,
                text: 'Dias até ruptura (máx. 60 dias)',
                color: '#666',
                font: { size: 12, weight: '500' }
              }
            },
            y: {
              grid: { display: false },
              border: { display: false },
              ticks: { 
                color: '#555', 
                font: { size: 11 },
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
              },
            }
          },
        layout: {
          padding: { right: 20, bottom: 72 }
        }
      }
    })
  }, [calcularDataRuptura])

  useEffect(() => {
    if (!canvasRef.current) return
    if (dadosParaExibicao.length > 0) {
      renderizarGrafico(dadosParaExibicao)
    } else {
      chartRef.current?.destroy()
    }
  }, [dadosParaExibicao, renderizarGrafico])

  const handleAplicarFiltro = () => {
    if (!dataInicio || !dataFim) return
    if (new Date(dataInicio) > new Date(dataFim)) {
      alert('Data inicial não pode ser maior que data final')
      return
    }
    salvarFiltro(dataInicio, dataFim)
    buscarPrevisaoRuptura(dataInicio, dataFim)
  }

  const handleDataInicioChange = (e) => {
    const valor = e.target.value
    setDataInicio(valor)
    if (valor && dataFim) {
      salvarFiltro(valor, dataFim)
    }
  }

  const handleDataFimChange = (e) => {
    const valor = e.target.value
    setDataFim(valor)
    if (dataInicio && valor) {
      salvarFiltro(dataInicio, valor)
    }
  }

  const handleBuscaChange = (e) => {
    setBuscaNome(e.target.value)
    setMostrarTodos(false)
  }

  const validos = dadosFiltrados
  const itensOcultos = validos.length - dadosParaExibicao.length
  const pluralInsumo = itensOcultos > 1 ? 's' : ''
  const pluralOculto = itensOcultos > 1 ? 's' : ''
  const avisoTexto = itensOcultos > 0
    ? `${itensOcultos} insumo${pluralInsumo} com cobertura > ${MAX_DIAS_EXIBICAO} dias oculto${pluralOculto}. Marque "Mostrar todos" para ver.`
    : ''

  return (
    <div className="grafico-consumo">
      <div className="grafico-cabecalho">
        <span className="grafico-titulo">
          Previsão de ruptura por insumo (dias de cobertura)
          {getPeriodoTexto() ? ` (${getPeriodoTexto()})` : ''}
        </span>

        <div className="grafico-filtro">
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
              onChange={handleDataInicioChange}
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
              onChange={handleDataFimChange}
              min={dataInicio}
              max={getHoje()}
            />
          </div>

          <div className="filtro-busca">
            <label htmlFor="grafico-busca-nome" className="filtro-label">
              {ICONE_BUSCA}
              <span>Buscar insumo</span>
            </label>
            <input
              type="text"
              id="grafico-busca-nome"
              className="input-busca"
              placeholder="Digite o nome..."
              value={buscaNome}
              onChange={handleBuscaChange}
            />
          </div>

          <button
            className="btn-aplicar-filtro"
            onClick={handleAplicarFiltro}
            disabled={carregando || !dataInicio || !dataFim}
          >
            Aplicar
          </button>

          {validos.length > MAX_ITENS_EXIBICAO && (
            <label className="filtro-toggle">
              <input
                type="checkbox"
                checked={mostrarTodos}
                onChange={(e) => setMostrarTodos(e.target.checked)}
              />
              <span>Mostrar todos ({validos.length})</span>
            </label>
          )}
        </div>
      </div>

      <div className="grafico-area" style={{ minHeight: alturaCanvas }}>
        {carregando
          ? <span className="grafico-carregando">Carregando...</span>
          : erro
            ? <span className="grafico-vazio">{erro}</span>
            : dadosParaExibicao.length > 0
              ? <canvas ref={canvasRef} />
              : <span className="grafico-vazio">Sem dados para exibir</span>
        }
      </div>

      {avisoTexto && !mostrarTodos && (
        <div className="grafico-aviso">
          {avisoTexto}
        </div>
      )}

      <div className="grafico-legenda">
        <span className="legenda-item"><span className="legenda-cor" style={{ background: CORES_RISCO.CRITICO }}>&nbsp;</span>Crítico (até 2 dias)</span>
        <span className="legenda-item"><span className="legenda-cor" style={{ background: CORES_RISCO.ATENCAO }}>&nbsp;</span>Atenção (3-5 dias)</span>
        <span className="legenda-item"><span className="legenda-cor" style={{ background: CORES_RISCO.ALERTA }}>&nbsp;</span>Alerta (6-10 dias)</span>
        <span className="legenda-item"><span className="legenda-cor" style={{ background: CORES_RISCO.OK }}>&nbsp;</span>OK (mais de 10 dias)</span>
        <span className="legenda-item"><span className="legenda-cor" style={{ background: CORES_RISCO.SEM_CONSUMO }}>&nbsp;</span>Sem consumo</span>
      </div>

      {itemSelecionado && (
        <div className="modal-overlay" onClick={() => setItemSelecionado(null)}>
          <div className="modal-sugestao" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const nivelCalc = calcularNivelRisco(itemSelecionado.diasDeCobertura, itemSelecionado.consumoMedioDiario)
              const dataRuptura = calcularDataRuptura(itemSelecionado.diasDeCobertura)
              return (
                <>
                  <div className="modal-cabecalho" style={{ borderTopColor: getCorRisco(nivelCalc) }}>
                    <h3 className="modal-titulo">{itemSelecionado.nomeInsumo}</h3>
                    <button className="modal-fechar" onClick={() => setItemSelecionado(null)} aria-label="Fechar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="modal-conteudo">
                    <div className="modal-risco" style={{ background: getCorRisco(nivelCalc) }}>
                      <span className="risco-label">{getRiscoLabel(nivelCalc)}</span>
                      <span className="risco-dias">{itemSelecionado.diasDeCobertura} dias de cobertura</span>
                    </div>

                    <div className="modal-detalhes">
                      <div className="detalhe-item">
                        <span className="detalhe-label">Quantidade atual</span>
                        <span className="detalhe-valor">{formatarInteiro(itemSelecionado.quantidadeAtual)} {itemSelecionado.unidadeMedida}</span>
                      </div>
                      <div className="detalhe-item">
                        <span className="detalhe-label">Consumo médio/dia</span>
                        <span className="detalhe-valor">{formatarInteiro(itemSelecionado.consumoMedioDiario)} {itemSelecionado.unidadeMedida}</span>
                      </div>
                      <div className="detalhe-item">
                        <span className="detalhe-label">Estoque mínimo</span>
                        <span className="detalhe-valor">{formatarInteiro(itemSelecionado.estoqueMinimo)} {itemSelecionado.unidadeMedida}</span>
                      </div>
                      {dataRuptura && (
                        <div className="detalhe-item destaque">
                          <span className="detalhe-label">Ruptura prevista</span>
                          <span className="detalhe-valor ruptura-prevista">{dataRuptura}</span>
                        </div>
                      )}
                    </div>

                    <div className="modal-sugestao-texto" style={{ borderLeftColor: getCorRisco(nivelCalc) }}>
                      <span className="sugestao-icone">{getSugestaoIcone(nivelCalc)}</span>
                      <p className="sugestao-mensagem">{getSugestaoMensagem(itemSelecionado, nivelCalc)}</p>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}