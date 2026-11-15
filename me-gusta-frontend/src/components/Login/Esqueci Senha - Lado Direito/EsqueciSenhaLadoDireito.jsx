import './EsqueciSenhaLadoDireito.css'
import logoMegusta from '../../../assets/logo-megusta.png'

export default function EsqueciSenhaLadoDireito({ enviando }) {
  return (
    <div className="cartao-direito">
      <img className="logo-megusta-esqueci-senha" src={logoMegusta} alt="logo-megusta" />
      <div className="pizza"></div>
      <button className="botao-enviar" type="submit" form="esqueci-senha-form" disabled={enviando}>
        Redefinir senha
      </button>
    </div>
  )
}
