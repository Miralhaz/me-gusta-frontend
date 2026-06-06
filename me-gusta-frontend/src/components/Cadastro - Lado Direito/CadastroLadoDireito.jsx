import './CadastroLadoDireito.css'
import logoMegusta from '../../assets/logo-megusta.png'

export default function CadastroLadoDireito() {
  return (
    <div className="cartao-direito">
      <img className="logo-megusta-cadastro" src={logoMegusta} alt="logo-megusta" />
      <div className="pizza"></div>
      <button className="botao-enviar" type="submit" form="register-form">
        Cadastre-se
      </button>
    </div>
  )
}
