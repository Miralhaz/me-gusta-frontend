import { memo } from 'react'
import './Toolbar.css'

function Toolbar({
  categoriaAtiva,
  busca,
  onBuscaChange,
  onNovoInsumo,
  onNovaCategoria
}) {
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

      <input
        className="insumos-busca"
        type="text"
        placeholder="Buscar insumo..."
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
      />
    </div>
  )
}

export default memo(Toolbar)