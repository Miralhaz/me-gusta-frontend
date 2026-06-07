import { useState } from 'react'
import CadastroForm from '../Cadastro - Formulario/CadastroForm'
import CadastroLadoDireito from '../Cadastro - Lado Direito/CadastroLadoDireito'
import './CadastroPage.css'
import api from '../../provider/api'
import Swal from 'sweetalert2'

export default function CadastroPage({ onNavigarLogin }) {
  const [formulario, setFormulario] = useState({ nome: '', email: '', senha: '', confirmacao: '' })

  function atualizarDados(evento) {
    const { name, value } = evento.target
    setFormulario((atual) => ({ ...atual, [name]: value }))
  }

  function enviarDados(evento) {
    evento.preventDefault()

    if (formulario.nome === '' || formulario.email === '' || formulario.senha === '' || formulario.confirmacao === '') {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Cadastro',
        text: 'Todos os campos são obrigatórios. Por favor, preencha todos os campos.',
        timer: 2000,
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
    }

    api.post("/usuarios", {
      nome: formulario.nome,
      email: formulario.email,
      senha: formulario.senha
    })
    .then((resposta) => {
      Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado com sucesso!',
        timer: 2000,
        showConfirmButton: false,
      })
      onNavigarLogin?.()
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
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigarLogin?.() }}>Login</a>
          </div>

          <h2 className="titulo">Realize o cadastro no sistema aqui!</h2>

          <CadastroForm form={formulario} onChange={atualizarDados} onSubmit={enviarDados} />
        </div>

        <CadastroLadoDireito />
      </div>
    </div>
  )
}
