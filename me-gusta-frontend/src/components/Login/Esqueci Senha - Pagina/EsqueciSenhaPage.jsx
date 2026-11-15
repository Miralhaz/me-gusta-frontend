import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EsqueciSenhaForm from '../Esqueci Senha - Formulario/EsqueciSenhaForm'
import EsqueciSenhaLadoDireito from '../Esqueci Senha - Lado Direito/EsqueciSenhaLadoDireito'
import './EsqueciSenhaPage.css'
import api from '../../../provider/api'
import Swal from 'sweetalert2'
import { requisitosPendentes, senhaAtendeRequisitos } from '../../../utils/senha'

export default function EsqueciSenhaPage() {
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({ email: '', senha: '', confirmacao: '' })
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false)
  const [enviando, setEnviando] = useState(false)

  function atualizarDados(evento) {
    const { name, value } = evento.target
    setFormulario((atual) => ({ ...atual, [name]: value }))
  }

  function enviarDados(evento) {
    evento.preventDefault()

    if (enviando) return

    if (formulario.email === '' || formulario.senha === '' || formulario.confirmacao === '') {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Redefinição',
        text: 'Todos os campos são obrigatórios. Por favor, preencha todos os campos.',
        timer: 4000,
        showConfirmButton: false,
      })
      return
    }

    if (!/\S+@\S+\.\S+/.test(formulario.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Redefinição',
        text: 'O email fornecido é inválido. Por favor, insira um email com @ e .',
        timer: 4000,
        showConfirmButton: false,
      })
      return
    }

    if (!senhaAtendeRequisitos(formulario.senha)) {
      const pendentes = requisitosPendentes(formulario.senha).map((requisito) => requisito.rotulo)
      Swal.fire({
        icon: 'error',
        title: 'Erro de Redefinição',
        text: `A senha não atende aos requisitos de segurança. Ainda falta: ${pendentes.join('; ')}.`,
        timer: 4000,
        showConfirmButton: false,
      })
      return
    }

    if (formulario.senha !== formulario.confirmacao) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Redefinição',
        text: 'As senhas não coincidem. Por favor, verifique e tente novamente.',
        timer: 4000,
        showConfirmButton: false,
      })
      return
    }

    setEnviando(true)

    api.put('/usuarios/senha', {
      email: formulario.email,
      novaSenha: formulario.senha,
    })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Senha redefinida com sucesso!',
          text: 'Use a nova senha para acessar o sistema.',
          timer: 2500,
          showConfirmButton: false,
        })
        navigate('/login')
      })
      .catch((erro) => {
        const status = erro.response?.status
        if (status === 404) {
          Swal.fire({
            icon: 'error',
            title: 'Email não cadastrado',
            text: 'Não encontramos uma conta com este email. Verifique e tente novamente.',
            timer: 4000,
            showConfirmButton: false,
          })
        } else if (status === 400) {
          Swal.fire({
            icon: 'error',
            title: 'Dados inválidos',
            text: 'Os dados informados ou a nova senha são inválidos. Verifique e tente novamente.',
            timer: 4000,
            showConfirmButton: false,
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro de Redefinição',
            text: 'Ocorreu um erro ao redefinir a senha. Tente novamente mais tarde.',
            timer: 3000,
            showConfirmButton: false,
          })
        }
      })
      .finally(() => setEnviando(false))
  }

  return (
    <div className="pagina-esqueci-senha">
      <div className="cartao">
        <div className="cartao-esquerdo">
          <div className="abas">
            <a href="" onClick={(e) => { e.preventDefault(); navigate('/cadastro') }}>Cadastro</a>
            <span className="separador">|</span>
            <a href="" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Login</a>
          </div>

          <h2 className="titulo">Esqueci minha senha</h2>

          <EsqueciSenhaForm
            form={formulario}
            onChange={atualizarDados}
            onSubmit={enviarDados}
            senhaVisivel={senhaVisivel}
            onAlternarSenha={() => setSenhaVisivel((atual) => !atual)}
            confirmacaoVisivel={confirmacaoVisivel}
            onAlternarConfirmacao={() => setConfirmacaoVisivel((atual) => !atual)}
          />
        </div>

        <EsqueciSenhaLadoDireito enviando={enviando} />
      </div>
    </div>
  )
}
