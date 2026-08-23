import Status from '../../Comum em páginas/Status/Status'
import './TabelaEstoque.css'

export default function TabelaEstoque({ itens, onEditar }) {

  if (itens.length === 0) {
    return <p className="estoque-tabela-vazia">Nenhum item encontrado no estoque.</p>
  }

  return (
    <table className="estoque-tabela">
      <thead>
        <tr>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Quantidade</th>
          <th>Unidade</th>
          <th>Estoque min.</th>
          <th>Validade</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((item) => (
          <tr key={item.id}>
            <td>{item.produto}</td>
            <td>{item.categoria}</td>
            <td>{item.quantidade}</td>
            <td>{item.unidade}</td>
            <td>{item.estoqueMinimo}</td>
            <td>{item.validade}</td>
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
  )
}
