import './TabelaVendas.css'

export default function TabelaVendas({ linhas, colunas, coluna, direcao, onOrdenar }) {
  const lista = Array.isArray(linhas) ? linhas : []

  if (lista.length === 0) {
    return <p className="vendas-tabela-vazia">Nenhum insumo encontrado.</p>
  }

  return (
    <table className="vendas-tabela">
      <thead>
        <tr>
          {colunas.map((colunaAtual) => {
            const ativa = colunaAtual.chave === coluna
            return (
              <th
                key={colunaAtual.chave}
                className={colunaAtual.tipo === 'numero' ? 'vendas-tabela-numero' : undefined}
                aria-sort={ativa ? (direcao === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <button
                  type="button"
                  className="vendas-th-ordenavel"
                  onClick={() => onOrdenar(colunaAtual.chave)}
                >
                  {colunaAtual.rotulo}
                  <span className="vendas-th-seta" aria-hidden="true">
                    {ativa ? (direcao === 'asc' ? '▲' : '▼') : ''}
                  </span>
                </button>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {lista.map((insumo, index) => (
          <tr key={`${insumo.codigo ?? 'sem-codigo'}-${insumo.nome ?? ''}-${index}`}>
            {colunas.map((colunaAtual) => (
              <td
                key={colunaAtual.chave}
                className={colunaAtual.tipo === 'numero' ? 'vendas-tabela-numero' : undefined}
              >
                {insumo[colunaAtual.chave] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
