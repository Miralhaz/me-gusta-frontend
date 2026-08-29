import Status from '../../Comum em páginas/Status/Status'
import { formatarNumero, nivelValidade } from '../../../utils/estoque'
import './TabelaEstoque.css'

function classeQuantidade(quantidade, minimo) {
  if (quantidade == null || minimo == null) return ''
  if (quantidade <= 0) return 'qtd-zerada'
  if (quantidade < minimo) return 'qtd-abaixo'
  if (quantidade < minimo * 1.2) return 'qtd-limite'
  return ''
}

export default function TabelaEstoque({ itens, onEditar, onVerLotes }) {
  if (itens.length === 0) {
    return <p className="estoque-tabela-vazia">Nenhum item encontrado no estoque.</p>
  }

  return (
    <div className="estoque-tabela-wrapper">
      <table className="estoque-tabela">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Quantidade</th>
            <th>Unidade</th>
            <th>Estoque min.</th>
            <th>Validade</th>
            <th>Lotes</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id}>
              <td>{item.produto}</td>
              <td>{item.categoria}</td>
              <td className={classeQuantidade(item.quantidade, item.estoqueMinimo)}>
                {formatarNumero(item.quantidade)}
              </td>
              <td>{item.unidade}</td>
              <td>{formatarNumero(item.estoqueMinimo)}</td>
              <td className={`validade-${nivelValidade(item.diasValidade)}`}>
                {item.validade}
              </td>
              <td>
                {item.qtdLotes > 0 ? (
                  <button
                    type="button"
                    className="estoque-badge-lotes"
                    onClick={() => onVerLotes?.(item)}
                    aria-label={`Ver lotes de ${item.produto}`}
                  >
                    {item.qtdLotes} {item.qtdLotes === 1 ? 'lote' : 'lotes'}
                  </button>
                ) : (
                  <span className="estoque-sem-lote">—</span>
                )}
              </td>
              <td><Status status={item.status} /></td>
              <td>
                <button
                  type="button"
                  className="estoque-botao-editar"
                  onClick={() => onEditar?.(item)}
                  aria-label={`Editar ${item.produto}`}
                >
                  ✎
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
