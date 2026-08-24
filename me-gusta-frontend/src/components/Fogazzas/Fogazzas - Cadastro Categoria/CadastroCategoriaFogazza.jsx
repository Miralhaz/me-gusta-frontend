import { useState } from 'react'
import api from '../../../provider/api'

export default function CadastroCategoriaFogazza({ onCadastrado, onFechar }) {
  const [nome, setNome] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    setEnviando(true)
    try {
      await api.post('/categoria-fogazza', { nome })
      onCadastrado?.()
      onFechar()
    } catch (err) {
      console.error('Erro ao cadastrar categoria:', err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="form-cadastro" onSubmit={handleSubmit}>
      <label>
        Nome da categoria:
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
      </label>
      <button type="submit" className="btn-primario" disabled={enviando}>
        {enviando ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}