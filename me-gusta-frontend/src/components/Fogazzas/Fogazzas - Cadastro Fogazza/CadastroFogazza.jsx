import { useState } from 'react'
import api from '../../../provider/api'

export default function CadastroFogazza({ categorias, onCadastrado, onFechar }) {
  const [nome, setNome] = useState('')
  const [categoriaFogazzaId, setCategoriaFogazzaId] = useState('')
  const [preco, setPreco] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim() || !categoriaFogazzaId || !preco) return
    setEnviando(true)
    try {
      await api.post('/fogazzas', {
        nome,
        preco: Number(preco),
        categoriaFogazzaId: Number(categoriaFogazzaId),
      })
      onCadastrado?.()
      onFechar()
    } catch (err) {
      console.error('Erro ao cadastrar fogazza:', err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="form-cadastro form-cadastro--grid" onSubmit={handleSubmit}>
      <label>
        Nome da Fogazza
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
      </label>
      <label>
        Categoria
        <select value={categoriaFogazzaId} onChange={(e) => setCategoriaFogazzaId(e.target.value)}>
          <option value="">Selecione</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label>
        Preço (R$)
        <input type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} />
      </label>
      <button type="submit" className="btn-primario form-cadastro__full" disabled={enviando}>
        {enviando ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}