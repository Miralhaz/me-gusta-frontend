import './Toolbar.css'

export default function Toolbar({categoriaAtiva, busca, onBuscaChange, modoVisualizacao,
  onModoVisualizacaoChange, onNovoInsumo, onConfigurarGiro}) {
    
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
          <button className="botao-outline" onClick={onConfigurarGiro}>
            Configurar Giro de Estoque
          </button>
        </div>
      </div>

      <div className="insumos-toolbar-baixo">
        <div className="insumos-toggle-visualizacao">
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