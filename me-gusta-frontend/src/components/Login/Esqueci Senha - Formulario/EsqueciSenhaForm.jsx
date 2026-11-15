import './EsqueciSenhaForm.css'
import visibilityOn from '../../../assets/visibility_on.png'
import visibilityOff from '../../../assets/visibility_off.png'
import { REQUISITOS_SENHA } from '../../../utils/senha'

export default function EsqueciSenhaForm({
  form,
  onChange,
  onSubmit,
  senhaVisivel,
  onAlternarSenha,
  confirmacaoVisivel,
  onAlternarConfirmacao,
}) {
  return (
    <form id="esqueci-senha-form" className="form-esqueci-senha" onSubmit={onSubmit} noValidate>
      <div className="campos">
        <label> Email: </label>
        <input name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} />
      </div>

      <div className="campos">
        <label> Nova senha: </label>
        <div className="linha-senha">
          <input
            name="senha"
            type={senhaVisivel ? 'text' : 'password'}
            maxLength={128}
            autoComplete="new-password"
            value={form.senha}
            onChange={onChange}
          />
          <button
            type="button"
            className="botao-visibilidade-senha"
            onClick={onAlternarSenha}
            aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {senhaVisivel ? (
              <img src={visibilityOff} alt="" aria-hidden="true" />
            ) : (
              <img src={visibilityOn} alt="" aria-hidden="true" />
            )}
          </button>
        </div>
        <ul className="requisitos-senha">
          {REQUISITOS_SENHA.map((requisito) => {
            const atendido = requisito.regex.test(form.senha)
            return (
              <li key={requisito.id} className={atendido ? 'atendido' : 'pendente'}>
                <span className="marcador-requisito" aria-hidden="true">{atendido ? '✔' : '○'}</span>
                {requisito.rotulo}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="campos">
        <label> Confirmar nova senha: </label>
        <div className="linha-senha">
          <input
            name="confirmacao"
            type={confirmacaoVisivel ? 'text' : 'password'}
            maxLength={128}
            autoComplete="new-password"
            value={form.confirmacao}
            onChange={onChange}
          />
          <button
            type="button"
            className="botao-visibilidade-senha"
            onClick={onAlternarConfirmacao}
            aria-label={confirmacaoVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {confirmacaoVisivel ? (
              <img src={visibilityOff} alt="" aria-hidden="true" />
            ) : (
              <img src={visibilityOn} alt="" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
