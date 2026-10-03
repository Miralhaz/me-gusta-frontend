import { memo } from 'react'
import './TabelaInsumos.css'
import { formatarData } from '../../../utils/estoque'

function TabelaInsumos({ insumos }) {
  const lista = Array.isArray(insumos) ? insumos : []

  if (lista.length === 0) {
    return <p className="insumos-tabela-vazia">Nenhum insumo encontrado.</p>
  }

  return (
    <div className="insumo-tabela-wrapper">
      <table className="insumos-tabela">
        <thead>
          <tr>
            <th>Código</th>
            <th>Insumo</th>
            <th>Categoria</th>
            <th>Data de cadastro</th>
            <th>Giro de Estoque (mês)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((insumo) => (
            <tr key={insumo.codigoInsumo}>
              <td>{insumo.codigoInsumo}</td>
              <td>{insumo.nome}</td>
              <td>{insumo.insumoCategoria?.nome ?? ''}</td>
              <td>{formatarData(insumo.dtCadastro)}</td>
              <td>{insumo.giroMensal?.toFixed(2) ?? '0.00'}</td>
              <td style={{ color: insumo.ativo ? 'green' : 'red', fontWeight: 'bold' }}>
                {insumo.ativo ? 'ATIVO' : 'INATIVO'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(TabelaInsumos)