import { useState } from 'react'
import api from '../../../provider/api'
import './ConfirmarRecebimento.css'

export default function ConfirmarRecebimento({ compra, onConfirmado, onFechar }) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleConfirmar() {
    setEnviando(true)
    setErro('')
    try {
      await api.patch(`/entradas-estoque/${compra.id}/confirmar-recebimento`)
      onConfirmado?.()
      onFechar()
    } catch (err) {
      console.error('Erro ao confirmar recebimento:', err)
      setErro('Não foi possível confirmar o recebimento. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="confirmar-recebimento">
      <p>
        Confirma que a compra <strong>{`#CO-${String(compra.id).padStart(3, '0')}`}</strong> ({compra.insumo?.nome}) chegou e deseja registrar a entrada no estoque?
      </p>

      {erro && <p className="confirmar-recebimento-erro">{erro}</p>}

      <div className="confirmar-recebimento-acoes">
        <button type="button" className="botao-outline" onClick={onFechar} disabled={enviando}>
          Não
        </button>
        <button type="button" className="btn-primario" onClick={handleConfirmar} disabled={enviando}>
          {enviando ? 'Confirmando...' : 'Sim'}
        </button>
      </div>
    </div>
  )
}
