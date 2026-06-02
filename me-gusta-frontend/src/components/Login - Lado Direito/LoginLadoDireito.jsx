import './LoginLadoDireito.css'

export default function LoginLadoDireito({ onNavigarDashboard }) {
  return (
    <div className="cartao-direito">
      <div className="pizza"></div>
      <button className="botao-enviar" type="submit" form="login-form" onClick={onNavigarDashboard}>
        Entrar
      </button>
    </div>
  )
}
