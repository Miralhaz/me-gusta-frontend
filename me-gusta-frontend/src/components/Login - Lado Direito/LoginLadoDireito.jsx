import './LoginLadoDireito.css'
import logoMegusta from '../../assets/logo-megusta.png'

export default function LoginLadoDireito({ onNavigarDashboard }) {
  return (
    <div className="cartao-direito">
      <img className="logo-megusta-login" src={logoMegusta} alt="logo-megusta" />
      <div className="pizza"></div>
      <button className="botao-enviar" type="submit" form="login-form" onClick={onNavigarDashboard}>
        Entrar
      </button>
    </div>
  )
}
