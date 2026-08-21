import { useState } from 'react'
import api from '../../../provider/api'

const UNIDADES = ['kg', 'g', 'L', 'ml', 'un']

export default function CadastroInsumo({ categorias, onCadastrado, onFechar }) {
  const [nome, setNome] = useState('')
  const [unidade, setUnidade] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estoqueMinimo, setEstoqueMinimo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim() || !unidade || !categoria) return
    setEnviando(true)
    try {
      await api.post('/insumos', {
        nome,
        unidade,
        categoriaId: categoria,
        estoqueMinimo: Number(estoqueMinimo) || 0,
      })
      onCadastrado?.()
      onFechar()
    } catch (err) {
      console.error('Erro ao cadastrar insumo:', err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="form-cadastro form-cadastro--grid" onSubmit={handleSubmit}>
      <label>
        Nome do Insumo
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
      </label>
      <label>
        Unidade de medida do Insumo
        <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
          <option value="">Selecione</option>
          {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </label>
      <label>
        Categoria do Insumo
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Selecione</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label>
        Estoque mínimo desejado
        <input type="number" min="0" value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value)} />
      </label>
      <button type="submit" className="btn-primario form-cadastro__full" disabled={enviando}>
        {enviando ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}