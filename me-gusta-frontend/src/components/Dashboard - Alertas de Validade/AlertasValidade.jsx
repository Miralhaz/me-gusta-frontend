import './AlertasValidade.css'

// Dados mockados — serão substituídos por props/fetch futuramente
const INSUMOS_PROXIMOS = [
  { nome: 'Frango Desfiado', data: 'Vence amanhã',    urgencia: 'critico' },
  { nome: 'Tomate',          data: 'Vence 29/03/2026', urgencia: 'critico' },
  { nome: 'Mussarela',       data: 'Vence 15/04/2026', urgencia: 'atencao' },
  { nome: 'Rúcula',          data: 'Vence 28/04/2026', urgencia: 'atencao' },
]

const ICONE_ALERTA = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const criticos  = INSUMOS_PROXIMOS.filter(i => i.urgencia === 'critico').length
const atencoes  = INSUMOS_PROXIMOS.filter(i => i.urgencia === 'atencao').length

export default function AlertasValidade() {
  return (
    <div className="alertas-validade">
      <div className="alertas-cabecalho">
        {ICONE_ALERTA}
        Alertas de validade
      </div>

      <div className="alertas-corpo">
        <div className="alerta-destaque">
          <strong>ATENÇÃO: {INSUMOS_PROXIMOS.length} Insumos próximos da Data de Vencimento.</strong>
          <ul>
            {criticos > 0  && <li>{criticos} {criticos === 1 ? 'Insumo extremamente próximo' : 'Insumos extremamente próximos'}.</li>}
            {atencoes > 0  && <li>{atencoes} {atencoes === 1 ? 'Insumo próximo' : 'Insumos próximos'}.</li>}
          </ul>
        </div>

        <div className="alertas-lista">
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 2 }}>
            Insumos próximos:
          </span>
          {INSUMOS_PROXIMOS.map((item) => (
            <div key={item.nome} className={`alerta-item ${item.urgencia}`}>
              <span>{item.nome}</span>
              <span className="alerta-item-data">{item.data}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
