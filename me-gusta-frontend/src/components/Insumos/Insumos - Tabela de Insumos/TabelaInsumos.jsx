import StatusBadge from '../../Comum em páginas/Status/Status'
import './TabelaInsumos.css'

export default function TabelaInsumos({ insumos }) {
  const lista = Array.isArray(insumos) ? insumos : []
     
  if (lista.length === 0) {
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
        {lista.map((insumo) => (
          <tr key={insumo.codigoInsumo}>
            <td>{insumo.codigoInsumo}</td>
            <td>{insumo.nome}</td>
            <td>{insumo.insumoCategoria.nome}</td>
            <td>{insumo.dtCadastro}</td>
            <td>{insumo.giroEstoque}</td>
            <td><StatusBadge status={insumo.tipoStatus.nome} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}