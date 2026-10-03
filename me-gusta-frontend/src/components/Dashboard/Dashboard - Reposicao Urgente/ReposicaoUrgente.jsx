import { useState, useEffect } from 'react'
import api from '../../../provider/api'
import { formatarNumero } from '../../../utils/estoque'
import './ReposicaoUrgente.css'

const ICONE_REPOSICAO = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

export default function ReposicaoUrgente() {
  const [itensReposicao, setItensReposicao] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/insumos')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        const itens = data
          .filter((insumo) => insumo.estoqueMinimo !== null && insumo.estoqueMinimo !== undefined && insumo.quantidadeAtual !== null && insumo.quantidadeAtual !== undefined)
          .map((insumo) => {
            const qtdAtual = Number(insumo.quantidadeAtual)
            const estoqueMinimo = Number(insumo.estoqueMinimo)
            if (estoqueMinimo <= 0) return null

            const percentual = (qtdAtual / estoqueMinimo) * 100
            let nivel = 'ok'
            if (qtdAtual <= 0) nivel = 'critico'
            else if (percentual <= 50) nivel = 'critico'
            else if (percentual <= 80) nivel = 'atencao'

            if (nivel === 'ok') return null

            const distanciaPercentual = Math.round(percentual)
            return {
              id: insumo.id,
              nome: insumo.nome,
              qtdAtual: `${formatarNumero(qtdAtual)} ${insumo.unidadeInsumo?.unidade ?? ''}`.trim(),
              distancia: `${distanciaPercentual}% do mínimo (${formatarNumero(estoqueMinimo)} ${insumo.unidadeInsumo?.unidade ?? ''})`.trim(),
              nivel,
              percentual,
              unidade: insumo.unidadeInsumo?.unidade ?? '',
              quantidadeAtual: qtdAtual,
              estoqueMinimo,
            }
          })
          .filter(Boolean)
          .sort((a, b) => a.percentual - b.percentual)

        setItensReposicao(itens)
      })
      .catch((e) => {
        console.error('Erro ao buscar insumos para reposição urgente:', e)
        setItensReposicao([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="reposicao-urgente">
        <div className="reposicao-cabecalho">
          Itens para repor urgentemente
          <span style={{ marginLeft: 'auto' }}>{ICONE_REPOSICAO}</span>
        </div>
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>Carregando...</div>
      </div>
    )
  }

  return (
    <div className="reposicao-urgente">
      <div className="reposicao-cabecalho">
        Itens para repor urgentemente
        <span style={{ marginLeft: 'auto' }}>{ICONE_REPOSICAO}</span>
      </div>

      {itensReposicao.length > 0 ? (
        <div className="reposicao-tabela-container">
          <table className="reposicao-tabela">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Qtd. Atual</th>
                <th>Distância do mínimo</th>
              </tr>
            </thead>
            <tbody>
              {itensReposicao.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.qtdAtual}</td>
                  <td>
                    <span className={`badge-distancia ${item.nivel}`}>
                      {item.distancia}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
          Nenhum item precisa de reposição urgente no momento.
        </div>
      )}
    </div>
  )
}