// Fonte única das regras de validade, status e formatação usadas na área de Estoque.

export const DIAS_CRITICO = 7
export const DIAS_ATENCAO = 60

const STATUS_PARA_CHAVE = {
  'OK': 'OK',
  'ATENÇÃO': 'ATENCAO',
  'CRÍTICO': 'CRITICO',
}

export function normalizarStatus(nome) {
  return STATUS_PARA_CHAVE[nome] ?? nome
}

export function extrairLista(res) {
  return Array.isArray(res.data) ? res.data : []
}

export function formatarData(iso) {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export function diasAteValidade(iso) {
  if (!iso) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const [ano, mes, dia] = iso.split('-').map(Number)
  return Math.round((new Date(ano, mes - 1, dia) - hoje) / 86400000)
}

export function nivelValidade(dias) {
  if (dias === null || dias === undefined) return 'sem-validade'
  if (dias < 0) return 'vencido'
  if (dias <= DIAS_CRITICO) return 'critico'
  if (dias <= DIAS_ATENCAO) return 'atencao'
  return 'ok'
}

export function rotuloUrgencia(dias) {
  if (dias === null || dias === undefined) return 'sem validade'
  if (dias < 0) return `vencido há ${Math.abs(dias)}d`
  if (dias === 0) return 'vence hoje'
  return `em ${dias}d`
}

export function statusPorValidade(dtValidade) {
  const nivel = nivelValidade(diasAteValidade(dtValidade))
  if (nivel === 'vencido' || nivel === 'critico') return 'CRÍTICO'
  if (nivel === 'atencao') return 'ATENÇÃO'
  return 'OK'
}
