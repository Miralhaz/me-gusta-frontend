import './ToolbarEstoque.css'

export default function ToolbarEstoque({ categorias, categoriaAtiva, onCategoriaChange,
  busca, onBuscaChange, onNovaSaida }) {

  return (
    <div className="estoque-toolbar">
      <div className="estoque-toolbar-esquerda">
        <select
          className="estoque-select-categoria"
          value={categoriaAtiva}
          onChange={(e) => onCategoriaChange(e.target.value)}
        >
          <option value="todos">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.nome}>{cat.nome}</option>
          ))}
        </select>

        <button type="button" className="botao-outline" onClick={onNovaSaida}>
          + Saída de Insumo
        </button>
      </div>

      <input
        className="estoque-busca"
        type="text"
        placeholder="Buscar produto..."
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
      />
    </div>
  )
}
