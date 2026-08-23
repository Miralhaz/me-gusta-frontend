import { useState, useEffect } from 'react'
import api from '../../../provider/api'

export default function CadastroSaida({ itens, onCadastrado, onFechar }) {
  const [motivos, setMotivos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [insumo, setInsumo] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [usuario, setUsuario] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.get('/motivos')
      .then((res) => setMotivos(res.data))
      .catch((e) => console.error('Erro ao buscar motivos:', e))

    // TODO: assim que o login guardar o usuário autenticado (ex: decodificando o
    // token JWT), trocar esse select por preenchimento automático do fkUsuario.
    api.get('/usuarios')
      .then((res) => setUsuarios(res.data))
      .catch((e) => console.error('Erro ao buscar usuários:', e))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!insumo || !quantidade || !motivo || !usuario) return
    setEnviando(true)
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
      console.error('Erro ao cadastrar saída de estoque:', err)
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
        Quantidade:
        <input
          type="number"
          min="0"
          step="0.01"
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
      <button type="submit" className="btn-primario" disabled={enviando}>
        {enviando ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}
