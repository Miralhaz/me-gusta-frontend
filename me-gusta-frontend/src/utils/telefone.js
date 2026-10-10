function somenteDigitos(valor) {
  return String(valor).replace(/\D/g, '')
}

function mascaraTelefone(valor) {
  let digitos = somenteDigitos(valor)
  if (digitos.length > 11 && digitos.startsWith('55')) digitos = digitos.slice(2)
  digitos = digitos.slice(0, 11)
  if (digitos.length <= 2) return digitos ? `(${digitos}` : ''
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

export { mascaraTelefone, somenteDigitos }