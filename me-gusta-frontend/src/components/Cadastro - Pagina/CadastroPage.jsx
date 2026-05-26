import { useState } from 'react'
import CadastroForm from '../Cadastro - Formulario/CadastroForm'
import CadastroLadoDireito from '../Cadastro - Lado Direito/CadastroLadoDireito'
import './CadastroPage.css'

export default function CadastroPage({ onNavigarLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })

  function handleChange(evento) {
    const { name, value } = evento.target
    setForm((atual) => ({ ...atual, [name]: value }))
  }

  function handleSubmit(evento) {
    evento.preventDefault()
    alert('Cadastro enviado (demo): ' + JSON.stringify(form, null, 2))
  }

  return (
    <div className="pagina-cadastro">
      <div className="cartao">
        <div className="cartao-esquerdo">
          <div className="abas">
            <a className="ativo" href="#">Cadastro</a>
            <span className="separador">|</span>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigarLogin?.() }}>Login</a>
          </div>

          <h2 className="titulo">Realize o cadastro no sistema aqui!</h2>

          <CadastroForm form={form} onChange={handleChange} onSubmit={handleSubmit} />
        </div>

        <CadastroLadoDireito />
      </div>
    </div>
  )
}
