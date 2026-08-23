import './Toolbar.css'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function gerarOpcoesMeses(quantidade = 12) {
  const hoje = new Date()
  return Array.from({ length: quantidade }, (_, i) => {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const valor = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    const rotulo = `${MESES[data.getMonth()]}/${String(data.getFullYear()).slice(2)}`
    return { valor, rotulo }
  })
}

const OPCOES_MESES = gerarOpcoesMeses()

export default function Toolbar({ busca, onBuscaChange, mesSelecionado, onMesChange, onImportar }) {
  return (
    <div className="vendas-toolbar">
      <button className="botao-outline" onClick={onImportar}>
        + Importar Vendas
      </button>

      <div className="vendas-toolbar-filtro-data">
        Data:
        <select value={mesSelecionado} onChange={(e) => onMesChange(e.target.value)}>
          <option value="todos">Todos</option>
          {OPCOES_MESES.map(({ valor, rotulo }) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
      </div>

      <input
        className="vendas-busca"
        type="text"
        placeholder="Busque uma fogazza"
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
      />
    </div>
  )
}
