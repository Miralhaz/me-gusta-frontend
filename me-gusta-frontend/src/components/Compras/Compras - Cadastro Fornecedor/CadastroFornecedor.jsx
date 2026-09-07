import { useState } from 'react'
import api from '../../../provider/api'
import Modal from '../../Comum em páginas/Modal/Modal'

export default function CadastroFornecedor({ onCadastrado, onFechar }) {
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarSucesso, setMostrarSucesso] = useState(false)
  const [mostrarErro, setMostrarErro] = useState(false)
  const [mensagemErro, setMensagemErro] = useState('')

  function limparFormulario() {
    setNome('')
    setCnpj('')
    setTelefone('')
    setErro('')
  }

  function extrairMensagemErro(err) {
    if (err.response?.data) {
      const data = err.response.data
      if (typeof data === 'string') return data
      if (data.message) return data.message
      if (data.errors) {
        return Object.values(data.errors).flat().join('; ')
      }
      if (data.cnpj) return `CNPJ inválido: ${data.cnpj}`
      if (data.nome) return `Nome: ${data.nome}`
      if (data.telefone) return `Telefone: ${data.telefone}`
    }
    return 'Erro ao cadastrar fornecedor. Verifique os dados e tente novamente.'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!nome.trim() || !cnpj.trim() || !telefone.trim()) {
      setErro('Preencha todos os campos.')
      return
    }

    setEnviando(true)
    try {
      await api.post('/fornecedores', { nome: nome.trim(), cnpj: cnpj.trim(), telefone: telefone.trim() })
      setMostrarSucesso(true)
      limparFormulario()
      onCadastrado?.()
    } catch (err) {
      console.error('Erro ao cadastrar fornecedor:', err)
      const msg = extrairMensagemErro(err)
      setMensagemErro(msg)
      setMostrarErro(true)
    } finally {
      setEnviando(false)
    }
  }

  const fecharSucesso = () => {
    setMostrarSucesso(false)
    onFechar()
  }

  const fecharErro = () => {
    setMostrarErro(false)
  }

  return (
    <>
      <form className="form-cadastro" onSubmit={handleSubmit}>
        <label>
          Nome do Fornecedor
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </label>
        <label>
          CNPJ do Fornecedor
          <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
        </label>
        <label>
          Telefone do Fornecedor
          <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
        </label>
        {erro && <p className="form-cadastro__erro">{erro}</p>}
        <button type="submit" className="btn-primario" disabled={enviando}>
          {enviando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <Modal aberto={mostrarSucesso} onFechar={fecharSucesso} titulo="Sucesso">
        <p>Fornecedor cadastrado com sucesso!</p>
        <div className="modal-acoes">
          <button className="btn-primario" onClick={fecharSucesso}>OK</button>
        </div>
      </Modal>

      <Modal aberto={mostrarErro} onFechar={fecharErro} titulo="Erro no Cadastro">
        <p>{mensagemErro}</p>
        <div className="modal-acoes">
          <button className="btn-primario" onClick={fecharErro}>Entendi</button>
        </div>
      </Modal>
    </>
  )
}