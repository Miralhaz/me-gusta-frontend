import { useState } from 'react'
import './MovimentacoesRecentes.css'

const MOVIMENTACOES = [
  { nome: 'Rúcula',   tipo: 'entrada', quantidade: '+1 kg',   data: '16/03/2026' },
  { nome: 'Catupiry', tipo: 'saida',   quantidade: '-0.5 kg', data: '18/03/2026' },
]

const ICONE_RELOGIO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const SETA_CIMA = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7a3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const SETA_BAIXO = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d62828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function MovimentacoesRecentes() {
  const [filtro, setFiltro] = useState('geral')

  return (
    <div className="movimentacoes">
      <div className="movimentacoes-cabecalho">
        <span className="movimentacoes-titulo">Movimentações recentes</span>
        {ICONE_RELOGIO}
      </div>

      <div className="movimentacoes-filtro-linha">
        <select
          className="select-filtro-mov"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="geral">Geral</option>
          <option value="entradas">Entradas</option>
          <option value="saidas">Saídas</option>
        </select>
      </div>

      <div className="movimentacoes-lista">
        {MOVIMENTACOES.map((mov, idx) => (
          <div key={idx} className="movimentacao-item">
            <span className="mov-seta">
              {mov.tipo === 'entrada' ? SETA_CIMA : SETA_BAIXO}
            </span>
            <span className="mov-nome">{mov.nome}</span>
            <div className="mov-direita">
              <span className={`mov-quantidade ${mov.tipo}`}>{mov.quantidade}</span>
              <span className="mov-data">{mov.data}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
