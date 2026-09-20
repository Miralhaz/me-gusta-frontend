import { ICONE_CALENDARIO } from '../Compras - Toolbar/Toolbar.icons'
import './Toolbar.css'

export default function Toolbar({
  filtroDataInicio, onFiltroDataInicioChange,
  filtroDataFim, onFiltroDataFimChange,
  busca, onBuscaChange,
  onNovaCompra, onNovoFornecedor,
}) {

  return (
    <div className="compras-toolbar">
      <div className="compras-toolbar-esquerda">
        <div className="compras-toolbar-acoes">
          <button className="botao-outline" onClick={onNovaCompra}>
            + Nova Compra
          </button>
          <button className="botao-outline" onClick={onNovoFornecedor}>
            + Novo Fornecedor
          </button>
        </div>

        <div className="compras-toolbar-filtros">
          <div className="labels-datas">
            <label htmlFor="compra-data-inicio" className="filtro-label">
              {ICONE_CALENDARIO}
              <span>Início</span>
            </label>
            <label htmlFor="compra-data-fim" className="filtro-label">
              {ICONE_CALENDARIO}
              <span>Fim</span>
            </label>
          </div>
          <div className="filtro-datas">
            <input
              type="date"
              id="compra-data-inicio"
              className="input-data"
              value={filtroDataInicio}
              onChange={(e) => onFiltroDataInicioChange(e.target.value)}
              max={filtroDataFim}
            />
            <input
              type="date"
              id="compra-data-fim"
              className="input-data"
              value={filtroDataFim}
              onChange={(e) => onFiltroDataFimChange(e.target.value)}
              min={filtroDataInicio}
            />
          </div>
        </div>
      </div>

      <input
        className="compras-busca"
        type="text"
        placeholder="Buscar por produto ou fornecedor..."
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
      />
    </div>
  )
}