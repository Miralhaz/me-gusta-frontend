import './Status.css'

const CORES = {
  OK: 'status-ok',
  ATENCAO: 'status-atencao',
  CRITICO: 'status-critico',
}

const LABELS = {
  OK: 'OK',
  ATENCAO: 'ATENÇÃO',
  CRITICO: 'CRÍTICO',
}

export default function Status({ status }) {

  return (
    <span className={`status ${CORES[status] ?? ''}`}>
      {LABELS[status] ?? status}
    </span>
  )
  
}