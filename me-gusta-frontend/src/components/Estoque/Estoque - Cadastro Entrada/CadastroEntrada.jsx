import { useState, useMemo } from 'react'
import api from '../../../provider/api'
import { statusPorValidade } from '../../../utils/estoque'

export default function CadastroEntrada({
  itens,
  fornecedores,
  unidades,
  tiposStatus,
  usuarios,
  onCadastrado,
  onFechar,
}) {
  const [insumo, setInsumo] = useState('')
  const [fornecedor, setFornecedor] = useState('')
  const [unidade, setUnidade] = useState('')
  const [quantidadeRelativa, setQuantidadeRelativa] = useState('')
  const [fator, setFator] = useState('1')
  const [lote, setLote] = useState('')
  const [dtValidade, setDtValidade] = useState('')
  const [dtPedido, setDtPedido] = useState('')
  const [vlTotal, setVlTotal] = useState('')
  const [usuario, setUsuario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  const insumoSelecionado = itens.find((i) => String(i.id) === insumo)

  const quantidadeAbsoluta = useMemo(() => {
    const rel = Number(quantidadeRelativa)
    const f = Number(fator)
    if (!rel || !f) return ''
    return (rel * f).toFixed(2)
  }, [quantidadeRelativa, fator])

  const statusNome = statusPorValidade(dtValidade)
  const idStatus = tiposStatus.find((t) => t.nome === statusNome)?.id

  const podeEnviar = Boolean(
    insumo && fornecedor && unidade && usuario && idStatus &&
    Number(quantidadeRelativa) > 0 && Number(quantidadeAbsoluta) > 0
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!podeEnviar) return
    setEnviando(true)
    setErro(null)
    try {
      await api.post('/entradas-estoque', {
        fkInsumo: Number(insumo),
        fkUsuario: Number(usuario),
        fkFornecedor: Number(fornecedor),
        fkTipoStatus: idStatus,
        fkUnidadeMedida: Number(unidade),
        quantidadeRelativa: Number(quantidadeRelativa),
        quantidadeAbsoluta: Number(quantidadeAbsoluta),
        lote: lote || null,
        dtValidade: dtValidade || null,
        dtPedido: dtPedido || null,
        vlTotal: vlTotal ? Number(vlTotal) : null,
      })
      onCadastrado?.()
      onFechar()
    } catch (err) {
      console.error('Erro ao cadastrar entrada de estoque:', err.response?.status, err.response?.data)
      setErro(typeof err.response?.data === 'string'
        ? err.response.data
        : 'Não foi possível cadastrar a entrada.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="form-cadastro form-cadastro--grid" onSubmit={handleSubmit}>
      <label className="form-cadastro__full">
        Insumo:
        <select value={insumo} onChange={(e) => setInsumo(e.target.value)} autoFocus>
          <option value="">Selecione</option>
          {itens.map((item) => (
            <option key={item.id} value={item.id}>{item.produto}</option>
          ))}
        </select>
      </label>

      <label>
        Fornecedor:
        <select value={fornecedor} onChange={(e) => setFornecedor(e.target.value)}>
          <option value="">Selecione</option>
          {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </label>

      <label>
        Unidade da compra:
        <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
          <option value="">Selecione</option>
          {unidades.map((u) => <option key={u.id} value={u.id}>{u.unidade}</option>)}
        </select>
      </label>

      <label>
        Quantidade comprada:
        <input
          type="number" min="0" step="0.01"
          value={quantidadeRelativa}
          onChange={(e) => setQuantidadeRelativa(e.target.value)}
        />
      </label>

      <label>
        Fator de conversão:
        <input
          type="number" min="0" step="0.001"
          value={fator}
          onChange={(e) => setFator(e.target.value)}
        />
      </label>

      <label className="form-cadastro__full">
        Quantidade em estoque {insumoSelecionado ? `(${insumoSelecionado.unidade})` : ''}:
        <input type="text" value={quantidadeAbsoluta} readOnly />
      </label>

      <label>
        Lote:
        <input type="text" value={lote} onChange={(e) => setLote(e.target.value)} />
      </label>

      <label>
        Data de validade:
        <input type="date" value={dtValidade} onChange={(e) => setDtValidade(e.target.value)} />
      </label>

      <label>
        Data do pedido:
        <input type="date" value={dtPedido} onChange={(e) => setDtPedido(e.target.value)} />
      </label>

      <label>
        Valor total (R$):
        <input
          type="number" min="0" step="0.01"
          value={vlTotal}
          onChange={(e) => setVlTotal(e.target.value)}
        />
      </label>

      <label className="form-cadastro__full">
        Registrado por:
        <select value={usuario} onChange={(e) => setUsuario(e.target.value)}>
          <option value="">Selecione</option>
          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
      </label>

      <p className="form-cadastro__full form-cadastro__nota">
        Status calculado pela validade: <strong>{statusNome}</strong>
      </p>

      {erro && <p className="form-cadastro__full form-cadastro__erro">{erro}</p>}

      <button type="submit" className="btn-primario form-cadastro__full" disabled={enviando || !podeEnviar}>
        {enviando ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}
