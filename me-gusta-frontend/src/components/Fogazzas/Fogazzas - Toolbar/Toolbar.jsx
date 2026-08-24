import './Toolbar.css'

export default function Toolbar({ categoriaAtiva, busca, onBuscaChange, modoVisualizacao,
  onModoVisualizacaoChange, onNovaFogazza }) {

  return (
    <div className="fogazzas-toolbar">
      <div className="fogazzas-toolbar-topo">
        <span className="fogazzas-toolbar-categoria">
          Categoria: <strong>{categoriaAtiva === 'todos' ? 'Todos' : categoriaAtiva}</strong>
        </span>

        <div className="fogazzas-toolbar-acoes">
          <button className="botao-outline" onClick={onNovaFogazza}>
            + Nova Fogazza
          </button>
        </div>
      </div>

      <div className="fogazzas-toolbar-baixo">
        <div className="fogazzas-toggle-visualizacao">
          <button
            className={modoVisualizacao === 'lista' ? 'ativo' : ''}
            onClick={() => onModoVisualizacaoChange('lista')}
          >
            ☰
          </button>
          <button
            className={modoVisualizacao === 'grade' ? 'ativo' : ''}
            onClick={() => onModoVisualizacaoChange('grade')}
          >
            ▦
          </button>
        </div>

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