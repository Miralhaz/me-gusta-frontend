// Política de senha do backend (UsuarioRequestDto / AlteracaoSenhaRequestDto):
// @Size(min = 8, max = 128) e @Pattern com letra maiúscula, minúscula, número e
// caractere especial. Fonte única de verdade desta tela: o checklist exibido e a
// validação do envio derivam daqui.
// Observação: CadastroPage mantém a própria cópia da política; unificar as duas é
// uma refatoração futura fora do escopo desta mudança.
const REQUISITOS_SENHA = [
  { id: 'tamanho', rotulo: 'Entre 8 e 128 caracteres', regex: /^.{8,128}$/ },
  { id: 'maiuscula', rotulo: 'Ao menos 1 letra maiúscula', regex: /[A-Z]/ },
  { id: 'minuscula', rotulo: 'Ao menos 1 letra minúscula', regex: /[a-z]/ },
  { id: 'numero', rotulo: 'Ao menos 1 número', regex: /[0-9]/ },
  { id: 'especial', rotulo: 'Ao menos 1 caractere especial (@ $ ! % * ? & - _ + = #)', regex: /[@$!%*?&_+=#-]/ },
]

function requisitosPendentes(senha) {
  return REQUISITOS_SENHA.filter((requisito) => !requisito.regex.test(senha))
}

function senhaAtendeRequisitos(senha) {
  return requisitosPendentes(senha).length === 0
}

export { REQUISITOS_SENHA, requisitosPendentes, senhaAtendeRequisitos }
