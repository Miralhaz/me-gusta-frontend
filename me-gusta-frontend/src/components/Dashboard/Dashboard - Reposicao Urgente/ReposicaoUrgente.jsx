import './ReposicaoUrgente.css'

const ITENS_REPOSICAO = [
  { nome: 'Bacon',   qtdAtual: '3 kg',   distancia: '60% do mínimo (5 kg)',  nivel: 'critico' },
  { nome: 'Farinha', qtdAtual: '1.2 kg', distancia: '30% do mínimo (4 kg)',  nivel: 'atencao' },
]

const ICONE_REPOSICAO = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

export default function ReposicaoUrgente() {
  return (
    <div className="reposicao-urgente">
      <div className="reposicao-cabecalho">
        Itens para repor urgentemente
        <span style={{ marginLeft: 'auto' }}>{ICONE_REPOSICAO}</span>
      </div>

      <table className="reposicao-tabela">
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Qtd. Atual</th>
            <th>Distância do mínimo</th>
          </tr>
        </thead>
        <tbody>
          {ITENS_REPOSICAO.map((item) => (
            <tr key={item.nome}>
              <td>{item.nome}</td>
              <td>{item.qtdAtual}</td>
              <td>
                <span className={`badge-distancia ${item.nivel}`}>
                  {item.distancia}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
