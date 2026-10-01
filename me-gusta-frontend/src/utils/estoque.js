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

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—'
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const FRACOES_COMUNS = [
  { valor: 1/8, label: '1/8' },
  { valor: 1/6, label: '1/6' },
  { valor: 1/5, label: '1/5' },
  { valor: 1/4, label: '1/4' },
  { valor: 1/3, label: '1/3' },
  { valor: 3/8, label: '3/8' },
  { valor: 2/5, label: '2/5' },
  { valor: 1/2, label: '1/2' },
  { valor: 3/5, label: '3/5' },
  { valor: 5/8, label: '5/8' },
  { valor: 2/3, label: '2/3' },
  { valor: 3/4, label: '3/4' },
  { valor: 4/5, label: '4/5' },
  { valor: 5/6, label: '5/6' },
  { valor: 7/8, label: '7/8' },
]

export function decimalParaFracao(valor) {
  const num = Number(valor)
  if (!isFinite(num)) return null
  const parteInteira = Math.floor(num)
  const parteDecimal = num - parteInteira
  if (parteDecimal === 0) return null
  let melhor = null
  let menorDiff = Infinity
  for (const f of FRACOES_COMUNS) {
    const diff = Math.abs(parteDecimal - f.valor)
    if (diff < menorDiff) {
      menorDiff = diff
      melhor = f
    }
  }
  if (!melhor || menorDiff > 0.04) return null
  if (parteInteira > 0) {
    return `${parteInteira} e ${melhor.label}`
  }
  return melhor.label
}

export function formatarConsumoLegivel(valor, unidade) {
  const num = Number(valor)
  if (!isFinite(num)) return '—'
  if (num >= 1) {
    return `${num.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unidade}/dia`
  }
  const fracao = decimalParaFracao(num)
  if (fracao) {
    return `${fracao} de ${unidade}/dia`
  }
  return `${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unidade}/dia`
}
