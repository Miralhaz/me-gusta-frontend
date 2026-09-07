import './Toolbar.css'

export default function Toolbar({
  filtroData, onFiltroDataChange,
  filtroStatus, onFiltroStatusChange,
  onNovaCompra, onNovoFornecedor,
}) {

  return (
    <div className="compras-toolbar">
      <div className="compras-toolbar-acoes">
        <button className="botao-outline" onClick={onNovaCompra}>
          + Nova Compra
        </button>
        <button className="botao-outline" onClick={onNovoFornecedor}>
          + Novo Fornecedor
        </button>
      </div>

      <div className="compras-toolbar-filtros">
        <label className="compras-filtro">
          Data:
          <select value={filtroData} onChange={(e) => onFiltroDataChange(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="mes">Este mês</option>
          </select>
        </label>

        <label className="compras-filtro">
          Status:
          <select value={filtroStatus} onChange={(e) => onFiltroStatusChange(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="Recebido">Recebido</option>
            <option value="Aguardando">Aguardando</option>
          </select>
        </label>
      </div>
    </div>
  )
}
