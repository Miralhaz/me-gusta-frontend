import StatusBadge from '../../Comum em páginas/Status/Status'
import './TabelaInsumos.css'

export default function TabelaInsumos({ insumos }) {
    
  if (insumos.length === 0) {
    return <p className="insumos-tabela-vazia">Nenhum insumo encontrado.</p>
  }

  return (
    <table className="insumos-tabela">
      <thead>
        <tr>
          <th>Código</th>
          <th>Insumo</th>
          <th>Categoria</th>
          <th>Data de cadastro</th>
          <th>Giro de Estoque (mês)</th>
          <th>Status no Estoque</th>
        </tr>
      </thead>
      <tbody>
        {insumos.map((insumo) => (
          <tr key={insumo.codigo}>
            <td>{insumo.codigo}</td>
            <td>{insumo.nome}</td>
            <td>{insumo.categoria}</td>
            <td>{insumo.dataCadastro}</td>
            <td>{insumo.giroEstoque}</td>
            <td><StatusBadge status={insumo.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}