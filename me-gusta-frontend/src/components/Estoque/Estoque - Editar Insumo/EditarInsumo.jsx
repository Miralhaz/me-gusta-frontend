import { useState } from 'react'
import api from '../../../provider/api'
import Status from '../../Comum em páginas/Status/Status'
import { normalizarStatus } from '../../../utils/estoque'

export default function EditarInsumo({
  insumo,
  categorias,
  unidades,
  onEditado,
  onFechar,
}) {
  const [nome, setNome] = useState(insumo.nome)
  const [codigoInsumo, setCodigoInsumo] = useState(insumo.codigoInsumo)
  const [categoria, setCategoria] = useState(insumo.insumoCategoria?.id ?? '')
  const [unidade, setUnidade] = useState(insumo.unidadeInsumo?.id ?? '')
  const [estoqueMinimo, setEstoqueMinimo] = useState(insumo.estoqueMinimo)
  const [quantidadeAtual, setQuantidadeAtual] = useState(insumo.quantidadeAtual)
  const [ativo, setAtivo] = useState(insumo.ativo)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  const podeEnviar = Boolean(
    nome.trim() && codigoInsumo.trim() && categoria && unidade
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!podeEnviar) return
    setEnviando(true)
    setErro(null)
    try {
      await api.put(`/insumos/${insumo.id}`, {
        nome,
        codigoInsumo,
        estoqueMinimo: Number(estoqueMinimo),
        quantidadeAtual: Number(quantidadeAtual),
        ativo,
        fkCategoriaInsumo: Number(categoria),
        fkUnidadeMedida: Number(unidade),
      })
      onEditado?.()
      onFechar()
    } catch (err) {
      console.error('Erro ao editar insumo:', err.response?.status, err.response?.data)
      setErro(typeof err.response?.data === 'string'
        ? err.response.data
        : 'Não foi possível salvar as alterações.')
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
        <div className="form-cadastro__status-somente-leitura">
          <Status status={normalizarStatus(insumo.tipoStatus?.nome)} />
        </div>
      </label>

      <label>
        Estoque mínimo
        <input
          type="number" min="0" step="0.01"
          value={estoqueMinimo}
          onChange={(e) => setEstoqueMinimo(e.target.value)}
        />
      </label>

      <label>
        Quantidade atual
        <input
          type="number" min="0" step="0.01"
          value={quantidadeAtual}
          onChange={(e) => setQuantidadeAtual(e.target.value)}
        />
      </label>

      <label>
        Ativo
        <select value={ativo ? 'true' : 'false'} onChange={(e) => setAtivo(e.target.value === 'true')}>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </label>

      {erro && <p className="form-cadastro__full form-cadastro__erro">{erro}</p>}

      <button type="submit" className="btn-primario form-cadastro__full" disabled={enviando || !podeEnviar}>
        {enviando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}
