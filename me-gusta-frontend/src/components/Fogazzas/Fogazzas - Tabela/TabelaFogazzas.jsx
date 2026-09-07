import './TabelaFogazzas.css'

export default function TabelaFogazzas({ fogazzas }) {
  const lista = Array.isArray(fogazzas) ? fogazzas : []

  if (lista.length === 0) {
    return <p className="fogazzas-tabela-vazia">Nenhuma fogazza encontrada.</p>
  }

  return (
    <table className="fogazzas-tabela">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Preço</th>
        </tr>
      </thead>
      <tbody>
        {lista.map((fogazza) => (
          <tr key={fogazza.id}>
            <td>{fogazza.nome}</td>
            <td>{fogazza.categoriaFogazza?.nome}</td>
            <td>{Number(fogazza.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}