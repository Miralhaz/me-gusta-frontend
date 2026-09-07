import './Toolbar.css'

export default function Toolbar({categoriaAtiva, busca, onBuscaChange, onNovoInsumo, onNovaCategoria, }) {
    
  return (
    <div className="insumos-toolbar">
      <div className="insumos-toolbar-topo">
        <span className="insumos-toolbar-categoria">
          Categoria: <strong>{categoriaAtiva === 'todos' ? 'Todos' : categoriaAtiva}</strong>
        </span>

        <div className="insumos-toolbar-acoes">
          <button className="botao-outline" onClick={onNovoInsumo}>
            + Novo Insumo
          </button>
          <button className="botao-outline" onClick={onNovaCategoria}>
            + Nova Categoria
          </button>
        </div>
      </div>

      <div className="insumos-toolbar-baixo">

        <input
          className="insumos-busca"
          type="text"
          placeholder="Ex: Presunto / #PO-002"
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
        />
      </div>
    </div>
  )
}