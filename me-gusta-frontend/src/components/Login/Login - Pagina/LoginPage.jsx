import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../Login - Formulario/LoginForm'
import LoginLadoDireito from '../Login - Lado Direito/LoginLadoDireito'
import './LoginPage.css'
import api from '../../../provider/api'
import Swal from 'sweetalert2'

export default function LoginPage() {

  const [formulario, setFormulario] = useState({ email: '', senha: '' })
  const navigate = useNavigate()

  function atualizarDados(evento) {
    const { name, value } = evento.target
    setFormulario((atual) => ({ ...atual, [name]: value }))
  }

  function enviarDados(evento) {
    evento.preventDefault()
    
    api.post("/login", {
      login: formulario.email,
      senha: formulario.senha
    })
    .then((resposta) => {
      // Configuração de token para ser armazenado no Cookie
      document.cookie = `token=${resposta.data.token}; path=/; max-age=7200`;
      Swal.fire({
        icon: 'success',
        title: 'Login realizado com sucesso!',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/dashboard')
    })
    .catch((erro) => {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Login',
        text: 'Ocorreu um erro ao realizar o login.',
        timer: 2000,
        showConfirmButton: false,
      })  
    })


  }

  return (
    <div className="pagina-login">
      <div className="cartao">
        <div className="cartao-esquerdo">
          <div className="abas">
            <a href="" onClick={(e) => { e.preventDefault(); navigate('/cadastro') }}>Cadastro</a>
            <span className="separador">|</span>
            <a className="ativo" href="">Login</a>
          </div>

          <h2 className="titulo">Faça login no sistema aqui!</h2>

          <LoginForm form={formulario} onChange={atualizarDados} onSubmit={enviarDados} />
        </div>

        <LoginLadoDireito />
      </div>
    </div>
  )
}
