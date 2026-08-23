import { useState, useEffect } from 'react'
import api from '../../../provider/api'

export default function EditarInsumo({ insumo, categorias, onEditado, onFechar }) {
  const [unidades, setUnidades] = useState([])
  const [statusList, setStatusList] = useState([])

  const [nome, setNome] = useState(insumo.nome)
  const [codigoInsumo, setCodigoInsumo] = useState(insumo.codigoInsumo)
  const [categoria, setCategoria] = useState(insumo.insumoCategoria?.id ?? '')
  const [unidade, setUnidade] = useState(insumo.unidadeInsumo?.id ?? '')
  const [status, setStatus] = useState(insumo.tipoStatus?.id ?? '')
  const [estoqueMinimo, setEstoqueMinimo] = useState(insumo.estoqueMinimo)
  const [quantidadeAtual, setQuantidadeAtual] = useState(insumo.quantidadeAtual)
  const [ativo, setAtivo] = useState(insumo.ativo)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.get('/unidade-medidas')
      .then((res) => setUnidades(res.data))
      .catch((e) => console.error('Erro ao buscar unidades de medida:', e))

    api.get('/tipo-status')
      .then((res) => setStatusList(res.data))
      .catch((e) => console.error('Erro ao buscar status:', e))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim() || !codigoInsumo.trim() || !categoria || !unidade || !status) return
    setEnviando(true)
    try {
      await api.put(`/insumos/${insumo.id}`, {
        nome,
        codigoInsumo,
        estoqueMinimo: Number(estoqueMinimo),
        quantidadeAtual: Number(quantidadeAtual),
        ativo,
        fkCategoriaInsumo: Number(categoria),
        fkUnidadeMedida: Number(unidade),
        fkStatus: Number(status),
      })
      onEditado?.()
      onFechar()
    } catch (err) {
      console.error('Erro ao editar insumo:', err)
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
        <input type="text" value={codigoInsumo} onChange={(e) => setCodigoInsumo(e.target.value)} />
      </label>
      <label>
        Categoria
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Selecione</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label>
        Unidade de medida
        <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
          <option value="">Selecione</option>
          {unidades.map((u) => <option key={u.id} value={u.id}>{u.unidade}</option>)}
        </select>
      </label>
      <label>
        Status no estoque
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Selecione</option>
          {statusList.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </label>
      <label>
        Estoque mínimo
        <input type="number" min="0" value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value)} />
      </label>
      <label>
        Quantidade atual
        <input type="number" min="0" value={quantidadeAtual} onChange={(e) => setQuantidadeAtual(e.target.value)} />
      </label>
      <label>
        Ativo
        <select value={ativo ? 'true' : 'false'} onChange={(e) => setAtivo(e.target.value === 'true')}>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </label>
      <button type="submit" className="btn-primario form-cadastro__full" disabled={enviando}>
        {enviando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}
