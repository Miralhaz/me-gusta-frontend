import { useState } from 'react'
import LoginForm from '../Login - Formulario/LoginForm'
import LoginLadoDireito from '../Login - Lado Direito/LoginLadoDireito'
import './LoginPage.css'

export default function LoginPage({ onNavigarCadastro }) {
  const [form, setForm] = useState({ email: '', password: '' })

  function handleChange(evento) {
    const { name, value } = evento.target
    setForm((atual) => ({ ...atual, [name]: value }))
  }

  function handleSubmit(evento) {
    evento.preventDefault()
    alert('Login enviado (demo): ' + JSON.stringify(form, null, 2))
  }

  return (
    <div className="pagina-login">
      <div className="cartao">
        <div className="cartao-esquerdo">
          <div className="abas">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigarCadastro?.() }}>Cadastro</a>
            <span className="separador">|</span>
            <a className="ativo" href="#">Login</a>
          </div>

          <h2 className="titulo">Faça login no sistema aqui!</h2>

          <LoginForm form={form} onChange={handleChange} onSubmit={handleSubmit} />
        </div>

        <LoginLadoDireito />
      </div>
    </div>
  )
}
