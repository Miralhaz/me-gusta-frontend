import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CadastroForm from '../Cadastro - Formulario/CadastroForm'
import CadastroLadoDireito from '../Cadastro - Lado Direito/CadastroLadoDireito'
import './CadastroPage.css'
import api from '../../../provider/api'
import Swal from 'sweetalert2'

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

// Política de senha do backend (UsuarioRequestDto): @Size(min = 8, max = 128) e
// @Pattern com letra maiúscula, minúscula, número e caractere especial.
// Fonte única de verdade: o checklist exibido e a validação do envio derivam daqui.
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

export default function CadastroPage() {
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({ nome: '', email: '', telefone: '', senha: '', confirmacao: '' })
  const [senhaVisivel, setSenhaVisivel] = useState(false)

  function atualizarDados(evento) {
    const { name, value } = evento.target
    const novoValor = name === 'telefone' ? mascaraTelefone(value) : value
    setFormulario((atual) => ({ ...atual, [name]: novoValor }))
  }

  function enviarDados(evento) {
    evento.preventDefault()

    if (
      formulario.nome === '' ||
      formulario.email === '' ||
      formulario.telefone === '' ||
      formulario.senha === '' ||
      formulario.confirmacao === ''
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Cadastro',
        text: 'Todos os campos são obrigatórios. Por favor, preencha todos os campos.',
        timer: 2000,
        showConfirmButton: false,
      })
      return
    } else if (!senhaAtendeRequisitos(formulario.senha)) {
      const pendentes = requisitosPendentes(formulario.senha).map((requisito) => requisito.rotulo)
      Swal.fire({
        icon: 'error',
        title: 'Erro de Cadastro',
        text: `A senha não atende aos requisitos de segurança. Ainda falta: ${pendentes.join('; ')}.`,
        timer: 4000,
        showConfirmButton: false,
      })
      return
    } else if (formulario.senha !== formulario.confirmacao) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Cadastro',
        text: 'As senhas não coincidem. Por favor, verifique e tente novamente.',
        timer: 2000,
        showConfirmButton: false,
      })
      return
    } else if (!/\S+@\S+\.\S+/.test(formulario.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Cadastro',
        text: 'O email fornecido é inválido. Por favor, insira um email válido.',
        timer: 2000,
        showConfirmButton: false,
      })
      return
    } else if (![11].includes(somenteDigitos(formulario.telefone).length)) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Cadastro',
        text: 'Informe um telefone (celular) válido com DDD.',
        timer: 2000,
        showConfirmButton: false,
      })
      return
    }

    api.post("/usuarios", {
      nome: formulario.nome,
      email: formulario.email,
      senha: formulario.senha,
      telefone: somenteDigitos(formulario.telefone)
    })
    .then((resposta) => {
      Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado com sucesso!',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/login')
    })
    .catch((erro) => {
      if (erro.response?.status === 409) {
        Swal.fire({
          icon: 'error',
          title: 'Usuário já foi criado',
          text: 'Este usuário ou email já foi cadastrado no sistema. Por favor, use outro email ou acesse a página de login.',
          timer: 3000,
          showConfirmButton: false,
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro de Cadastro',
          text: 'Ocorreu um erro ao realizar o cadastro.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
    })
  }

  return (
    <div className="pagina-cadastro">
      <div className="cartao">
        <div className="cartao-esquerdo">
          <div className="abas">
            <a className="ativo" href="#">Cadastro</a>
            <span className="separador">|</span>
            <a href="" onClick={() => navigate('/login')}>Login</a>
          </div>

          <h2 className="titulo">Realize o cadastro no sistema aqui!</h2>

          <CadastroForm
            form={formulario}
            onChange={atualizarDados}
            onSubmit={enviarDados}
            requisitosSenha={REQUISITOS_SENHA}
            senhaVisivel={senhaVisivel}
            onAlternarVisibilidade={() => setSenhaVisivel((atual) => !atual)}
          />
        </div>

        <CadastroLadoDireito />
      </div>
    </div>
  )
}
