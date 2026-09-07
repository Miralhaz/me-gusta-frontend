import './Sidebar.css'

export default function Sidebar({ categorias, categoriaAtiva, onSelecionarCategoria, onNovaCategoria }) {

  return (
    <aside className="insumos-sidebar">
      <h3 className="insumos-sidebar-titulo">Categorias</h3>

      <ul className="insumos-sidebar-lista">
        <li
          className={categoriaAtiva === 'todos' ? 'ativo' : ''}
          onClick={() => onSelecionarCategoria('todos')}
        >
          Todos
        </li>
        {(Array.isArray(categorias) ? categorias : []).map((cat) => (
          <li
            key={cat.id}
            className={categoriaAtiva === cat.nome ? 'ativo' : ''}
            onClick={() => onSelecionarCategoria(cat.nome)}
          >
            {cat.nome}
          </li>
        ))}
      </ul>
    </aside>
  )
  
}