import Status from '../../Comum em páginas/Status/Status'
import { formatarMoeda } from '../../../utils/estoque'
import './TabelaCompras.css'

function calcularValorUnitario(compra) {
  const total = Number(compra.vlTotal)
  const quantidade = Number(compra.quantidadeAbsoluta)
  if (!total || !quantidade) return null
  return total / quantidade
}

function formatarDataISO(dataISO) {
  if (!dataISO) return '—'
  return new Date(dataISO).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export default function TabelaCompras({ compras, onPedirConfirmacao }) {
  if (compras.length === 0) {
    return <p className="compras-tabela-vazia">Nenhuma compra encontrada.</p>
  }

  return (
    <div className="compras-tabela-wrapper">
      <table className="compras-tabela">
        <thead>
          <tr>
            <th>Código</th>
            <th>Fornecedor</th>
            <th>Item comprado</th>
            <th>Qtd.</th>
            <th>Valor total</th>
            <th>Data da compra</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => {
            const statusNome = compra.tipoStatus?.nome ?? ''
            const aguardando = statusNome.toLowerCase() === 'aguardando'

            return (
              <tr key={compra.id}>
                <td>{`#CO-${String(compra.id).padStart(3, '0')}`}</td>
                <td>{compra.fornecedor?.nome}</td>
                <td>{compra.insumo?.nome}</td>
                <td>{compra.quantidadeAbsoluta} {compra.unidadeMedida?.unidade}</td>
                <td>{formatarMoeda(compra.vlTotal)}</td>
                <td>
                  {formatarDataISO(compra.dtPedido)}
                  {aguardando && (
                    <button
                      className="compras-status-confirmar"
                      title="Marcar como recebido"
                      onClick={() => onPedirConfirmacao?.(compra)}
                      style={{marginLeft: '8px'}}
                    >
                      ✔
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}