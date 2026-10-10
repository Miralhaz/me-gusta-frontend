import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import UsuarioForm from '../Usuario - Formulario/UsuarioForm'
import ModalSenha from '../Usuario - Modal Senha/ModalSenha'
import './UsuarioPage.css'
import api, { apiSemInterceptor, sair } from '../../../provider/api'
import Swal from 'sweetalert2'
import { mascaraTelefone, somenteDigitos } from '../../../utils/telefone'

// Helper de identidade (D1): lê o cookie `token`, decodifica o payload (base64url)
// do segundo segmento do JWT e devolve o claim `sub` (email do usuário logado).
// A decodificação é apenas leitura do próprio payload emitido pelo backend; a
// autenticação real continua sendo validada pelo backend a cada requisição.
function emailDoUsuarioLogado() {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('token='))
  if (!cookie) return null

  const token = cookie.slice('token='.length)
  const [, payload] = token.split('.')
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const normalizado = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decodificado = JSON.parse(atob(normalizado))
    return decodificado.sub || null
  } catch {
    return null
  }
}

export default function UsuarioPage() {
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({ nome: '', email: '', telefone: '' })
  const [usuarioId, setUsuarioId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState('')
  const [emailOriginal, setEmailOriginal] = useState('')
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)
  const [senhaModal, setSenhaModal] = useState('')
  const [processandoSenha, setProcessandoSenha] = useState(false)

  useEffect(() => {
    const email = emailDoUsuarioLogado()
    if (!email) {
      // Sem token/dados de sessão: mensagem + redirecionamento, como no 401 (R1).
      Swal.fire({
        icon: 'error',
        title: 'Sessão inválida',
        text: 'Não foi possível identificar o usuário logado. Faça login novamente.',
        timer: 3000,
        showConfirmButton: false,
      }).then(() => navigate('/login'))
      return
    }

    api.get('/usuarios')
      .then((resposta) => {
        const lista = Array.isArray(resposta.data) ? resposta.data : []
        const usuario = lista.find((item) => item.email === email)
        if (!usuario) {
          // Email não encontrado na lista: tratar como sessão inválida (R1).
          setCarregando(false)
          Swal.fire({
            icon: 'error',
            title: 'Sessão inválida',
            text: 'Não foi possível encontrar seus dados de usuário. Faça login novamente.',
            timer: 3000,
            showConfirmButton: false,
          }).then(() => navigate('/login'))
          return
        }

        setUsuarioId(usuario.id)
        setEmailOriginal(usuario.email || '')
        setFormulario({
          nome: usuario.nome || '',
          email: usuario.email || '',
          telefone: mascaraTelefone(usuario.telefone || ''),
        })
        setCarregando(false)
      })
      .catch(() => {
        // O 401 (e o 403) já são tratados pelo interceptor global: redireciona para /login.
        setCarregando(false)
        setErroCarregamento('Ocorreu um erro ao carregar seus dados. Tente novamente.')
      })
  }, [navigate])

  function atualizarDados(evento) {
    const { name, value } = evento.target
    const novoValor = name === 'telefone' ? mascaraTelefone(value) : value
    setFormulario((atual) => ({ ...atual, [name]: novoValor }))
  }

  function alertarSucesso() {
    Swal.fire({
      icon: 'success',
      title: 'Dados atualizados com sucesso!',
      timer: 2000,
      showConfirmButton: false,
    })
  }

  function exibirErroSalvamento(erro) {
    const status = erro.response?.status
    if (status === 409) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Atualização',
        text: 'Email ou nome já cadastrado',
        timer: 4000,
        showConfirmButton: false,
      })
    } else if (status === 400) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Atualização',
        text: 'Dados inválidos. Verifique os campos informados.',
        timer: 4000,
        showConfirmButton: false,
      })
    } else if (status === 403) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Atualização',
        text: 'Você não tem permissão para atualizar estes dados.',
        timer: 4000,
        showConfirmButton: false,
      })
    } else if (status === 404) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Atualização',
        text: 'Usuário não encontrado.',
        timer: 4000,
        showConfirmButton: false,
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Atualização',
        text: 'Ocorreu um erro ao salvar os dados. Tente novamente.',
        timer: 4000,
        showConfirmButton: false,
      })
    }
  }

  function enviarDados(evento) {
    evento.preventDefault()

    if (formulario.nome === '' || formulario.email === '' || formulario.telefone === '') {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Atualização',
        text: 'Todos os campos são obrigatórios. Por favor, preencha todos os campos.',
        timer: 4000,
        showConfirmButton: false,
      })
      return
    }

    if (!/\S+@\S+\.\S+/.test(formulario.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Atualização',
        text: 'O email fornecido é inválido. Por favor, insira um email com @ e .',
        timer: 4000,
        showConfirmButton: false,
      })
      return
    }

    const quantidadeDigitos = somenteDigitos(formulario.telefone).length
    if (quantidadeDigitos < 10 || quantidadeDigitos > 11) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de Atualização',
        text: 'Informe um telefone (celular) válido com DDD (10 ou 11 dígitos).',
        timer: 4000,
        showConfirmButton: false,
      })
      return
    }

    // Troca de e-mail: o JWT atual leva o e-mail antigo no `sub` e passaria a não
    // encontrar mais o usuário (403 em todas as chamadas). Antes de salvar, o modal
    // pede a senha para que o token possa ser renovado logo depois do PUT.
    if (formulario.email.trim() !== emailOriginal) {
      setSenhaModal('')
      setModalSenhaAberto(true)
      return
    }

    salvarPerfil()
  }

  function salvarPerfil() {
    api.put(`/usuarios/${usuarioId}`, {
      nome: formulario.nome,
      email: formulario.email,
      telefone: somenteDigitos(formulario.telefone),
    })
      .then(() => alertarSucesso())
      .catch((erro) => exibirErroSalvamento(erro))
  }

  function fecharModalSenha() {
    setModalSenhaAberto(false)
    setSenhaModal('')
  }

  async function confirmarAlteracaoEmail(senha) {
    // 1) Valida a senha com o e-mail ATUAL antes de alterar qualquer dado, para não
    //    trocar o e-mail com a senha errada. Usa apiSemInterceptor: um 401 aqui
    //    significa "senha incorreta" e NÃO deve limpar o cookie nem redirecionar.
    setProcessandoSenha(true)
    try {
      await apiSemInterceptor.post('/login', { login: emailOriginal, senha })
    } catch (erro) {
      if (erro.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Senha incorreta',
          text: 'A senha informada não confere. Por favor, tente novamente.',
          timer: 3000,
          showConfirmButton: false,
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro de Atualização',
          text: 'Não foi possível validar sua senha. Tente novamente.',
          timer: 3000,
          showConfirmButton: false,
        })
      }
      setProcessandoSenha(false)
      return
    }

    // 2) Atualiza o perfil (o PUT segue autenticado com o token antigo, que ainda
    //    resolve o usuário).
    try {
      await api.put(`/usuarios/${usuarioId}`, {
        nome: formulario.nome,
        email: formulario.email,
        telefone: somenteDigitos(formulario.telefone),
      })
    } catch (erro) {
      fecharModalSenha()
      exibirErroSalvamento(erro)
      setProcessandoSenha(false)
      return
    }

    // 3) Renova o token: login com o NOVO e-mail gera um JWT com o `sub` novo e o
    //    cookie é trocado imediatamente, mantendo a sessão viva.
    try {
      const resposta = await api.post('/login', { login: formulario.email, senha })
      document.cookie = `token=${resposta.data.token}; path=/; max-age=7200`
      setEmailOriginal(formulario.email)
      fecharModalSenha()
      alertarSucesso()
    } catch {
      // Dados salvos, mas sem token novo: a sessão antiga não resolve mais o usuário.
      Swal.fire({
        icon: 'error',
        title: 'Sessão encerrada',
        text: 'Os dados foram salvos, mas não foi possível renovar seu token. Faça login novamente com o novo e-mail.',
        timer: 4000,
        showConfirmButton: false,
      }).then(() => sair(navigate))
    } finally {
      setProcessandoSenha(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="pagina-usuario">
        <div className="cartao">
          <div className="cartao-esquerdo">
            <h2 className="titulo">Dados de Usuário</h2>

            {carregando && (
              <p className="usuario-aviso usuario-carregando" role="status">
                Carregando seus dados...
              </p>
            )}

            {!carregando && erroCarregamento && (
              <p className="usuario-aviso usuario-erro">{erroCarregamento}</p>
            )}

            {!carregando && !erroCarregamento && (
              <UsuarioForm
                form={formulario}
                onChange={atualizarDados}
                onSubmit={enviarDados}
              />
            )}
          </div>
        </div>
      </div>

      <Modal aberto={modalSenhaAberto} onFechar={fecharModalSenha} titulo="Confirmar alteração de e-mail">
        <ModalSenha
          senha={senhaModal}
          onChange={(evento) => setSenhaModal(evento.target.value)}
          onConfirmar={confirmarAlteracaoEmail}
          processando={processandoSenha}
        />
      </Modal>
    </>
  )
}
