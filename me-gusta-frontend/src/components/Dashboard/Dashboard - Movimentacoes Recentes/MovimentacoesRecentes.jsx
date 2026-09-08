import { useState, useEffect } from 'react'
import api from '../../../provider/api'
import './MovimentacoesRecentes.css'

const ICONE_RELOGIO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const SETA_CIMA = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7a3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const SETA_BAIXO = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d62828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ICONE_CALENDARIO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export default function MovimentacoesRecentes() {
  const [filtro, setFiltro] = useState('geral')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [movimentacoes, setMovimentacoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const getHoje = () => new Date().toISOString().split('T')[0]
  const getSeteDiasAtras = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  useEffect(() => {
    const hoje = getHoje()
    const seteDiasAtras = getSeteDiasAtras()
    setDataInicio(seteDiasAtras)
    setDataFim(hoje)
    buscarMovimentacoes(seteDiasAtras, hoje)
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

  const buscarMovimentacoes = async (inicio, fim) => {
    setCarregando(true)
    setErro(null)
    try {
      const response = await api.get('/movimentacoes/periodo', {
        params: { dataInicio: inicio, dataFim: fim }
      })
      setMovimentacoes(response.data || [])
    } catch (e) {
      if (e.response?.status !== 204) {
        console.error('Erro ao buscar movimentações:', e)
        setErro('Erro ao carregar movimentações')
      }
      setMovimentacoes([])
    } finally {
      setCarregando(false)
    }
  }

  const handleAplicarFiltro = () => {
    if (!dataInicio || !dataFim) return
    if (new Date(dataInicio) > new Date(dataFim)) {
      setErro('Data inicial não pode ser maior que data final')
      return
    }
    buscarMovimentacoes(dataInicio, dataFim)
  }

  const movimentacoesFiltradas = movimentacoes.filter(m => {
    if (filtro === 'entradas') return m.tipo === 'entrada'
    if (filtro === 'saidas') return m.tipo === 'saida'
    return true
  })

  const formatarDataHora = (dataISO) => {
    if (!dataISO) return ''
    const data = new Date(dataISO)
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatarQuantidade = (quantidade, tipo) => {
    const valor = Number(quantidade).toFixed(2).replace('.', ',')
    return tipo === 'entrada' ? `+${valor}` : `-${valor}`
  }

  return (
    <div className="movimentacoes">
      <div className="movimentacoes-cabecalho">
        <div className="movimentacoes-titulo-container">
          <span className="movimentacoes-titulo">Movimentações recentes</span>
          {getPeriodoTexto() && (
            <span className="movimentacoes-periodo">{getPeriodoTexto()}</span>
          )}
        </div>
        {ICONE_RELOGIO}
      </div>

      <div className="movimentacoes-filtros">
        <div className='labels-datas'>
          <label htmlFor="data-inicio" className="filtro-label">
            {ICONE_CALENDARIO}
            <span>Início</span>
          </label>
          <label htmlFor="data-fim" className="filtro-label">
            {ICONE_CALENDARIO}
            <span>Fim</span>
          </label>
        </div>
        <div className="filtro-datas">
          <input
            type="date"
            id="data-inicio"
            className="input-data"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            max={dataFim || getHoje()}
          />
          <input
            type="date"
            id="data-fim"
            className="input-data"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            min={dataInicio}
            max={getHoje()}
          />
          <div className="movimentacoes-filtro-linha">
            <select
              className="select-filtro-mov"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="geral">Geral</option>
              <option value="entradas">Entradas</option>
              <option value="saidas">Saídas</option>
            </select>
          </div>
        </div>
        <button
          className="btn-aplicar-filtro"
          onClick={handleAplicarFiltro}
          disabled={carregando || !dataInicio || !dataFim}
        >
          Aplicar
        </button>
      </div>

      {erro && <div className="movimentacoes-erro">{erro}</div>}

      <div className="movimentacoes-lista">
        {carregando ? (
          <div className="movimentacoes-carregando">Carregando...</div>
        ) : movimentacoesFiltradas.length === 0 ? (
          <div className="movimentacoes-vazio">Nenhuma movimentação encontrada</div>
        ) : (
          movimentacoesFiltradas.map((mov, idx) => (
            <div key={idx} className="movimentacao-item">
              <span className="mov-seta">
                {mov.tipo === 'entrada' ? SETA_CIMA : SETA_BAIXO}
              </span>
              <span className="mov-nome">{mov.insumo?.nome || 'Insumo'}</span>
              <div className="mov-direita">
                <span className={`mov-quantidade ${mov.tipo}`}>
                  {formatarQuantidade(mov.quantidade, mov.tipo)} {mov.insumo?.unidade || ''}
                </span>
                <span className="mov-data">{formatarDataHora(mov.data)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}