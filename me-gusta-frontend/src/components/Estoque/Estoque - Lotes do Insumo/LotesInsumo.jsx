import { useEffect, useState } from 'react'
import api from '../../../provider/api'
import {
  formatarData,
  formatarNumero,
  diasAteValidade,
  nivelValidade,
  rotuloUrgencia,
  extrairLista,
} from '../../../utils/estoque'
import './LotesInsumo.css'

const SEM_VALIDADE = '9999-12-31'

const STORAGE_KEY_PREFIX = 'lotes-ocultos-'

function getOcultos(insumoId) {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${insumoId}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function salvarOcultos(insumoId, ocultos) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${insumoId}`, JSON.stringify(ocultos))
  } catch (e) {
    console.warn('Não foi possível salvar lotes ocultos:', e)
  }
}

export default function LotesInsumo({ insumo }) {
  const [lotes, setLotes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [ocultos, setOcultos] = useState(() => insumo?.id ? getOcultos(insumo.id) : [])
  const [mostrarOcultos, setMostrarOcultos] = useState(false)

  useEffect(() => {
    if (!insumo?.id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOcultos(getOcultos(insumo.id))
  }, [insumo?.id])

  useEffect(() => {
    if (!insumo?.id) return
    let ativo = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregando(true)
    setErro(null)
    api.get(`/entradas-estoque/insumo/${insumo.id}`)
      .then((res) => {
        if (!ativo) return
        const dados = extrairLista(res)
        dados.sort((a, b) =>
          (a.dtValidade ?? SEM_VALIDADE).localeCompare(b.dtValidade ?? SEM_VALIDADE)
        )
        setLotes(dados)
      })
      .catch((e) => {
        if (!ativo) return
        console.error('Erro ao buscar lotes:', e)
        setErro('Não foi possível carregar os lotes.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [insumo?.id])

  const ocultarLote = (loteId) => {
    const novosOcultos = [...ocultos, loteId]
    setOcultos(novosOcultos)
    salvarOcultos(insumo.id, novosOcultos)
  }

  const restaurarLote = (loteId) => {
    const novosOcultos = ocultos.filter((id) => id !== loteId)
    setOcultos(novosOcultos)
    salvarOcultos(insumo.id, novosOcultos)
  }

  const restaurarTodos = () => {
    setOcultos([])
    salvarOcultos(insumo.id, [])
  }

  const lotesVisiveis = lotes.filter((lote) => {
    const isVencido = diasAteValidade(lote.dtValidade) < 0
    const isOculto = ocultos.includes(lote.id)
    if (mostrarOcultos) return true
    return !(isVencido && isOculto)
  })

  if (carregando) return <p className="lotes-mensagem">Carregando lotes...</p>
  if (erro) return <p className="lotes-mensagem">{erro}</p>
  if (lotesVisiveis.length === 0) {
    if (ocultos.length > 0 && !mostrarOcultos) {
      return (
        <div className="lotes-vazio-com-ocultos">
          <p className="lotes-mensagem">Todos os lotes vencidos foram ocultados.</p>
          <button className="btn-restaurar" onClick={restaurarTodos}>
            Mostrar lotes ocultos ({ocultos.length})
          </button>
        </div>
      )
    }
    return <p className="lotes-mensagem">Nenhum lote registrado para este insumo.</p>
  }

  return (
    <div className="lotes-wrapper">
      {(ocultos.length > 0 && !mostrarOcultos) && (
        <div className="lotes-barra-ocultos">
          <span>{ocultos.length} lote{ocultos.length > 1 ? 's' : ''} vencido{ocultos.length > 1 ? 's' : ''} oculto{ocultos.length > 1 ? 's' : ''}</span>
          <button className="btn-mostrar-ocultos" onClick={() => setMostrarOcultos(true)}>
            Mostrar
          </button>
        </div>
      )}
      <table className="lotes-tabela">
        <thead>
          <tr>
            <th>Lote</th>
            <th>Validade</th>
            <th>Quantidade</th>
            <th>Fornecedor</th>
            <th>Entrada</th>
            <th style={{ width: 40, textAlign: 'center' }}></th>
          </tr>
        </thead>
        <tbody>
          {lotesVisiveis.map((lote) => {
            const dias = diasAteValidade(lote.dtValidade)
            const isVencido = dias < 0
            const isOculto = ocultos.includes(lote.id)
            return (
              <tr key={lote.id} className={`lote-${nivelValidade(dias)} ${isOculto ? 'lote-oculto' : ''}`}>
                <td>{lote.lote ?? '—'}</td>
                <td>
                  {formatarData(lote.dtValidade)}
                  <span className="lotes-dias">{rotuloUrgencia(dias)}</span>
                </td>
                <td>{formatarNumero(lote.quantidadeAbsoluta)} {insumo.unidade}</td>
                <td>{lote.fornecedor?.nome ?? '—'}</td>
                <td>{lote.dtEntrada ? formatarData(lote.dtEntrada.slice(0, 10)) : '—'}</td>
                <td style={{ textAlign: 'center' }}>
                  {isVencido && !isOculto && (
                    <button
                      className="btn-ocultar-lote"
                      onClick={() => ocultarLote(lote.id)}
                      title="Ocultar este lote vencido da visualização"
                      aria-label={`Ocultar lote ${lote.lote}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                  {isOculto && (
                    <button
                      className="btn-restaurar-lote"
                      onClick={() => restaurarLote(lote.id)}
                      title="Restaurar este lote à visualização"
                      aria-label={`Restaurar lote ${lote.lote}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {mostrarOcultos && ocultos.length > 0 && (
        <div className="lotes-barra-ocultos">
          <span>Exibindo lotes ocultos</span>
          <button className="btn-esconder-ocultos" onClick={() => setMostrarOcultos(false)}>
            Esconder
          </button>
        </div>
      )}
    </div>
  )
}
