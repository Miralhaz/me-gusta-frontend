import { useState } from 'react'
import api from '../../../provider/api'

export default function CadastroInsumo({ categorias, unidadeMedida, onCadastrado, onFechar }) {
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [quantidadeAtual, setQuantidadeAtual] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [unidade, setUnidade] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estoqueMinimo, setEstoqueMinimo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim() || !codigo || !quantidadeAtual || !unidade || !categoria) return
    setEnviando(true)
    try {
      await api.post('/insumos', {
        nome,
        codigoInsumo: codigo,
        quantidadeAtual: Number(quantidadeAtual),
        ativo,
        fkCategoriaInsumo: categoria,
        fkUnidadeMedida: unidade,
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
        Código do Insumo
        <input type="text" placeholder='XXX-001' value={codigo} onChange={(e) => setCodigo(e.target.value)} />
      </label>
      <label>
        Quantidade Atual no Estoque
        <input type="number" min="0" value={quantidadeAtual} onChange={(e) => setQuantidadeAtual(e.target.value)} />
      </label>
      <label>
        Unidade de medida do Insumo
        <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
          <option value="">Selecione</option>
          {unidadeMedida.map((u) => <option key={u.id} value={u.id}>{u.unidade}</option>)}
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
      <label>
        Ativo?
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
      </label>
      <button type="submit" className="btn-primario form-cadastro__full" disabled={enviando}>
        {enviando ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}