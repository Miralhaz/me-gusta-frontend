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

export default function LotesInsumo({ insumo }) {
  const [lotes, setLotes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!insumo?.id) return
    let ativo = true
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

  if (carregando) return <p className="lotes-mensagem">Carregando lotes...</p>
  if (erro) return <p className="lotes-mensagem">{erro}</p>
  if (lotes.length === 0) {
    return <p className="lotes-mensagem">Nenhum lote registrado para este insumo.</p>
  }

  return (
    <div className="lotes-wrapper">
      <table className="lotes-tabela">
        <thead>
          <tr>
            <th>Lote</th>
            <th>Validade</th>
            <th>Quantidade</th>
            <th>Fornecedor</th>
            <th>Entrada</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote) => {
            const dias = diasAteValidade(lote.dtValidade)
            return (
              <tr key={lote.id} className={`lote-${nivelValidade(dias)}`}>
                <td>{lote.lote ?? '—'}</td>
                <td>
                  {formatarData(lote.dtValidade)}
                  <span className="lotes-dias">{rotuloUrgencia(dias)}</span>
                </td>
                <td>{formatarNumero(lote.quantidadeAbsoluta)} {insumo.unidade}</td>
                <td>{lote.fornecedor?.nome ?? '—'}</td>
                <td>{lote.dtEntrada ? formatarData(lote.dtEntrada.slice(0, 10)) : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
