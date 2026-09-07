import './Toolbar.css'

export default function Toolbar({ categoriaAtiva, busca, onBuscaChange,
 onNovaFogazza, onNovaCategoriaFogazza }) {

  return (
    <div className="fogazzas-toolbar">
      <div className="fogazzas-toolbar-topo">
        <span className="fogazzas-toolbar-categoria">
          Categoria: <strong>{categoriaAtiva === 'todos' ? 'Todos' : categoriaAtiva}</strong>
        </span>

        <div className="fogazzas-toolbar-acoes">
          <button className="botao-outline" onClick={onNovaCategoriaFogazza}>
            + Nova Categoria
          </button>
          <button className="botao-outline" onClick={onNovaFogazza}>
            + Nova Fogazza
          </button>
        </div>
      </div>

      <div className="fogazzas-toolbar-baixo">
        <input
          className="fogazzas-busca"
          type="text"
          placeholder="Ex: Presunto / #PD-002"
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
        />
      </div>
    </div>
  )
}