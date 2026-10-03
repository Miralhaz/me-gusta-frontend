import './Toolbar.css'

const TODAS = 'todas'

export default function Toolbar({ busca, onBuscaChange, unidades, unidadeSelecionada, onUnidadeChange, onImportar }) {
  return (
    <div className="vendas-toolbar">
      <button className="botao-outline" onClick={onImportar}>
        + Importar Vendas
      </button>

      <div className="vendas-toolbar-filtro-unidade">
        Unidade de medida:
        <select
          aria-label="Unidade de medida"
          value={unidadeSelecionada}
          onChange={(e) => onUnidadeChange(e.target.value)}
        >
          <option value={TODAS}>Todas</option>
          {unidades.map((unidade) => (
            <option key={unidade} value={unidade}>{unidade}</option>
          ))}
        </select>
      </div>

      <input
        className="vendas-busca"
        type="text"
        placeholder="Busque um Insumo"
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
      />
    </div>
  )
}
