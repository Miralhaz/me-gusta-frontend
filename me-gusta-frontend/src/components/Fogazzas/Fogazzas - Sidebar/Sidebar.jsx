import './Sidebar.css'

export default function Sidebar({ categorias, categoriaAtiva, onSelecionarCategoria, onNovaCategoria }) {

  return (
    <aside className="fogazzas-sidebar">
      <h3 className="fogazzas-sidebar-titulo">Categorias</h3>

      <ul className="fogazzas-sidebar-lista">
        <li
          className={categoriaAtiva === 'todos' ? 'ativo' : ''}
          onClick={() => onSelecionarCategoria('todos')}
        >
          Todos
        </li>
        {categorias.map((cat) => (
          <li
            key={cat.id}
            className={categoriaAtiva === cat.nome ? 'ativo' : ''}
            onClick={() => onSelecionarCategoria(cat.nome)}
          >
            {cat.nome}
          </li>
        ))}
      </ul>

      <button className="fogazzas-sidebar-botao" onClick={onNovaCategoria}>
        + Nova Categoria
      </button>
    </aside>
  )
}