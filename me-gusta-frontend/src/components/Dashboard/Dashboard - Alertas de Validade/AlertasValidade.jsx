import { useState, useEffect, useCallback } from 'react'
import api from '../../../provider/api'
import { formatarData, formatarNumero, extrairLista, diasAteValidade } from '../../../utils/estoque'
import Modal from '../../Comum em páginas/Modal/Modal'
import './AlertasValidade.css'

const DIAS_CRITICO = 10
const DIAS_MUITO_PROXIMO = 20
const DIAS_ATENCAO_ESTENDIDA = 31

const ICONE_ALERTA = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ICONE_FECHAR = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function rotuloCustom(dias) {
  if (dias === null || dias === undefined) return 'sem validade'
  if (dias < 0) return `venceu em ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`
  if (dias === 0) return 'vence hoje'
  return `vence em ${dias}d`
}

function getCategoria(dias) {
  if (dias === null || dias === undefined) return 'sem-validade'
  if (dias < 0) return 'vencido'
  if (dias <= DIAS_CRITICO) return 'critico'
  if (dias <= DIAS_MUITO_PROXIMO) return 'muito-proximo'
  if (dias <= DIAS_ATENCAO_ESTENDIDA) return 'atencao-estendida'
  return 'ok'
}

const STORAGE_KEY = 'alertas-validade-ocultos'

function getOcultos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function salvarOcultos(ocultos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ocultos))
  } catch (e) {
    console.warn('Não foi possível salvar itens ocultos:', e)
  }
}

export default function AlertasValidade() {
  const [insumosProximos, setInsumosProximos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalItens, setModalItens] = useState([])
  const [ocultos, setOcultos] = useState([])

  useEffect(() => {
    setOcultos(getOcultos())
  }, [])

  const ocultarItem = (itemId) => {
    const novosOcultos = [...ocultos, itemId]
    setOcultos(novosOcultos)
    salvarOcultos(novosOcultos)
    setInsumosProximos(prev => prev.filter(i => i.id !== itemId))
  }

  const restaurarTodos = () => {
    setOcultos([])
    salvarOcultos([])
    buscarDados()
  }

  const buscarDados = useCallback(async () => {
    let ativo = true

    try {
      const [resInsumos, resEntradas] = await Promise.all([
        api.get('/insumos'),
        api.get('/entradas-estoque')
      ])

      if (!ativo) return

      const insumosData = extrairLista(resInsumos)
      const entradasData = extrairLista(resEntradas)

      const insumoInfo = new Map()
      for (const insumo of insumosData) {
        if (insumo.id) {
          insumoInfo.set(insumo.id, {
            quantidadeAtual: insumo.quantidadeAtual,
            estoqueMinimo: insumo.estoqueMinimo,
            unidade: insumo.unidadeInsumo?.unidade ?? '',
            nome: insumo.nome,
          })
        }
      }

      const mapaPorInsumo = new Map()

      for (const entrada of entradasData) {
        const insumo = entrada.insumo
        if (!insumo?.id || !entrada.dtValidade) continue

        const id = insumo.id
        const dias = diasAteValidade(entrada.dtValidade)
        const categoria = getCategoria(dias)

        if (categoria === 'ok' || categoria === 'sem-validade') continue

        const info = insumoInfo.get(id) ?? {}
        const existente = mapaPorInsumo.get(id)
        if (!existente || dias < existente.dias) {
          mapaPorInsumo.set(id, {
            id,
            nome: info.nome ?? insumo.nome,
            dias,
            dtValidade: entrada.dtValidade,
            unidade: info.unidade,
            quantidadeAtual: info.quantidadeAtual,
            estoqueMinimo: info.estoqueMinimo,
            fornecedor: entrada.fornecedor?.nome ?? '—',
            lote: entrada.lote ?? '—',
          })
        }
      }

      const proximos = Array.from(mapaPorInsumo.values())
        .filter(item => !ocultos.includes(item.id))
        .map((item) => ({
          ...item,
          data: rotuloCustom(item.dias),
          urgencia: getCategoria(item.dias),
        }))
        .sort((a, b) => a.dias - b.dias)

      setInsumosProximos(proximos)
    } catch (e) {
      console.error('Erro ao buscar dados para alertas de validade:', e)
      setInsumosProximos([])
    } finally {
      if (ativo) setLoading(false)
    }

    return () => { ativo = false }
  }, [ocultos])

  useEffect(() => {
    buscarDados()
  }, [buscarDados])

  const vencidos = insumosProximos.filter(i => i.dias < 0)
  const criticos = insumosProximos.filter(i => i.dias >= 0 && i.dias <= DIAS_CRITICO)
  const muitoProximos = insumosProximos.filter(i => i.dias > DIAS_CRITICO && i.dias <= DIAS_MUITO_PROXIMO)
  const atencaoEstendida = insumosProximos.filter(i => i.dias > DIAS_MUITO_PROXIMO && i.dias <= DIAS_ATENCAO_ESTENDIDA)
  const total = insumosProximos.length

  const abrirModalComTodos = () => {
    setModalItens([...vencidos, ...criticos, ...muitoProximos])
    setModalAberto(true)
  }

  const abrirModalCategoria = (categoria) => {
    if (categoria === 'vencido') setModalItens(vencidos)
    else if (categoria === 'critico') setModalItens(criticos)
    else if (categoria === 'muito-proximo') setModalItens(muitoProximos)
    else if (categoria === 'atencao-estendida') setModalItens(atencaoEstendida)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setModalItens([])
  }

  const temVencido = modalItens.some(i => i.dias < 0)
  const temCritico = modalItens.some(i => i.dias >= 0 && i.dias <= DIAS_CRITICO)
  const temMuitoProximo = modalItens.some(i => i.dias > DIAS_CRITICO)

  const tituloModal = temVencido && (temCritico || temMuitoProximo)
    ? 'Insumos Vencidos e Próximos do Vencimento'
    : temVencido
      ? 'Insumos Vencidos'
      : temCritico && temMuitoProximo
        ? 'Insumos Próximos do Vencimento'
        : temCritico
          ? 'Insumos Extremamente Próximos (≤10 dias)'
          : 'Insumos Muito Próximos (≤20 dias)'

  if (loading) {
    return (
      <div className="alertas-validade">
        <div className="alertas-cabecalho">
          {ICONE_ALERTA}
          Alertas de validade
        </div>
        <div className="alertas-corpo">
          <div className="alerta-destaque">
            <strong>Carregando...</strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="alertas-validade">
      <div className="alertas-cabecalho">
        {ICONE_ALERTA}
        Alertas de validade
      </div>

      <div className="alertas-corpo">
          <div
            className={`alerta-destaque ${total === 0 ? 'alerta-ok' : ''}`}
            onClick={total === 0 ? undefined : abrirModalComTodos}
            role={total === 0 ? undefined : 'button'}
            tabIndex={total === 0 ? undefined : 0}
            onKeyDown={total === 0 ? undefined : (e) => (e.key === 'Enter' || e.key === ' ') && abrirModalComTodos()}
            aria-label={total === 0 ? undefined : `Ver ${vencidos.length} insumos vencidos e ${criticos.length + muitoProximos.length} insumos próximos do vencimento`}
          >
            {total === 0 ? (
              <>
                <span className="alerta-ok-icon">✓</span>
                <strong>OK</strong>
                <p>Não há insumo(s) vencido(s) ou próximo(s) da data de vencimento!</p>
              </>
            ) : (
              <>
                <strong>ATENÇÃO: {total} Insumo(s) próximo(s) ou vencido(s).</strong>
                <ul>
                  {vencidos.length > 0 && (
                    <li>{vencidos.length} {vencidos.length === 1 ? 'Insumo passou da data de validade' : 'Insumos passaram da data de validade'}.</li>
                  )}
                  {criticos.length > 0 && (
                    <li>{criticos.length} {criticos.length === 1 ? 'Insumo extremamente próximo (≤10 dias)' : 'Insumos extremamente próximos (≤10 dias)'}.</li>
                  )}
                  {muitoProximos.length > 0 && (
                    <li>{muitoProximos.length} {muitoProximos.length === 1 ? 'Insumo muito próximo (≤20 dias)' : 'Insumos muito próximos (≤20 dias)'}.</li>
                  )}
                </ul>
              </>
            )}
          </div>

          <div className="alertas-lista">
            <div className="alertas-lista-cabecalho">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
                Insumo(s) próximo(s) ou vencido(s):
              </span>
              {ocultos.length > 0 && (
                <button
                  className="btn-restaurar"
                  onClick={restaurarTodos}
                  title="Restaurar itens ocultos"
                >
                  {ocultos.length} oculto{ocultos.length > 1 ? 's' : ''} • Restaurar
                </button>
              )}
            </div>
            {total === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px', fontSize: 13 }}>
                Nenhum dado encontrado.
              </div>
            ) : (
              [...vencidos, ...criticos, ...muitoProximos, ...atencaoEstendida].map((item) => (
                <div
                  key={item.id}
                  className={`alerta-item ${getCategoria(item.dias)}`}
                  onClick={() => abrirModalCategoria(getCategoria(item.dias))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && abrirModalCategoria(getCategoria(item.dias))}
                >
                  <span>{item.nome}</span>
                  <span className="alerta-item-data">{item.data}</span>
                  <button
                    className="btn-ocultar"
                    onClick={(e) => {
                      e.stopPropagation()
                      ocultarItem(item.id)
                    }}
                    title="Ocultar este alerta"
                    aria-label={`Ocultar alerta de ${item.nome}`}
                  >
                    {ICONE_FECHAR}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      <Modal
        aberto={modalAberto}
        onFechar={fecharModal}
        titulo={tituloModal}
      >
        <div className="modal-detalhes-validade">
          {modalItens.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Nenhum insumo nesta categoria.</p>
          ) : (
            <div className="modal-tabela-wrapper">
              <table className="modal-tabela">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Validade</th>
                    <th>Qtd. Atual</th>
                    <th>Est. Mínimo</th>
                    <th>Fornecedor</th>
                    <th>Lote</th>
                  </tr>
                </thead>
                <tbody>
                  {modalItens.map((item) => (
                    <tr key={item.id} className={`lote-${getCategoria(item.dias)}`}>
                      <td style={{ fontWeight: 500 }}>{item.nome}</td>
                      <td>
                        {formatarData(item.dtValidade)}
                        <span className="lotes-dias">{item.data}</span>
                      </td>
                      <td>{formatarNumero(item.quantidadeAtual)} {item.unidade}</td>
                      <td>{formatarNumero(item.estoqueMinimo)} {item.unidade}</td>
                      <td>{item.fornecedor}</td>
                      <td>{item.lote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}