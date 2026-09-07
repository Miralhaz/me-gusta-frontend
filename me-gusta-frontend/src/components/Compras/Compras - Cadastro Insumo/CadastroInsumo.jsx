import { useNavigate } from 'react-router-dom'

export default function CadastroInsumo({ onFechar }) {
  const navigate = useNavigate()

  function irParaCadastroDeInsumo() {
    onFechar()
    navigate('/insumos', { state: { abrirCadastroInsumo: true } })
  }

  return (
    <div className="cadastro-insumo-redirecionar">
      <p>O cadastro de insumos é feito na tela de Insumos.</p>
      <button className="btn-primario" onClick={irParaCadastroDeInsumo}>
        Ir para Insumos
      </button>
    </div>
  )
}