import './TabelaVendas.css'

export default function TabelaVendas({ vendas }) {

  if (vendas.length === 0) {
    return <p className="vendas-tabela-vazia">Nenhuma venda encontrada.</p>
  }

  return (
    <table className="vendas-tabela">
      <thead>
        <tr>
          <th>Código da venda</th>
          <th>Fogazza</th>
          <th>Quantidade</th>
          <th>Data da venda</th>
        </tr>
      </thead>
      <tbody>
        {vendas.map((venda, index) => (
          <tr key={`${venda.codigo}-${index}`}>
            <td>{venda.codigo}</td>
            <td>{venda.fogazza}</td>
            <td>{venda.quantidade}</td>
            <td>{venda.dataVenda ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
