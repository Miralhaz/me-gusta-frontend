import { useState } from 'react'
import api from '../../../provider/api'

export default function CadastroSaida({ itens, motivos, usuarios, onCadastrado, onFechar }) {
  const [insumo, setInsumo] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [usuario, setUsuario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  const insumoSelecionado = itens.find((i) => String(i.id) === insumo)

  const podeEnviar = Boolean(insumo && motivo && usuario && Number(quantidade) > 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!podeEnviar) return
    setEnviando(true)
    setErro(null)
    try {
      await api.post('/saidas-estoque', {
        fkInsumo: Number(insumo),
        fkUsuario: Number(usuario),
        quantidade: Number(quantidade),
        fkMotivo: Number(motivo),
      })
      onCadastrado?.()
      onFechar()
    } catch (err) {
      console.error('Erro ao cadastrar saída de estoque:', err.response?.status, err.response?.data)
      setErro(typeof err.response?.data === 'string'
        ? err.response.data
        : 'Não foi possível cadastrar a saída.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="form-cadastro" onSubmit={handleSubmit}>
      <label>
        Selecione insumo:
        <select value={insumo} onChange={(e) => setInsumo(e.target.value)} autoFocus>
          <option value="">Selecione</option>
          {itens.map((item) => (
            <option key={item.id} value={item.id}>{item.produto}</option>
          ))}
        </select>
      </label>

      <label>
        Quantidade {insumoSelecionado ? `(${insumoSelecionado.unidade})` : ''}:
        <input
          type="number" min="0" step="0.01"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
      </label>

      <label>
        Motivo da saída:
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
          <option value="">Selecione</option>
          {motivos.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </label>

      <label>
        Registrado por:
        <select value={usuario} onChange={(e) => setUsuario(e.target.value)}>
          <option value="">Selecione</option>
          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
      </label>

      {erro && <p className="form-cadastro__erro">{erro}</p>}

      <button type="submit" className="btn-primario" disabled={enviando || !podeEnviar}>
        {enviando ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}
