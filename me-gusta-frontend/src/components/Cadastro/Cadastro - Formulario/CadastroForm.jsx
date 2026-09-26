import './CadastroForm.css'

export default function CadastroForm({ form, onChange, onSubmit, requisitosSenha, senhaVisivel, onAlternarVisibilidade }) {
    return (
        <form id="register-form" className="formulario" onSubmit={onSubmit}>
            <div className="campos">
                <label> Nome de Usuário: </label>
                <input name="nome" type='text' value={form.nome} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Email: </label>
                <input name="email" type="email" value={form.email} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Telefone: </label>
                <input name="telefone" type="tel" inputMode="numeric" maxLength={15} autoComplete="tel" placeholder="(11) 99999-9999" value={form.telefone} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Senha: </label>
                <div className="linha-senha">
                    <input name="senha" type={senhaVisivel ? 'text' : 'password'} maxLength={128} value={form.senha} onChange={onChange} />
                    <button
                        type="button"
                        className="botao-visibilidade-senha"
                        onClick={onAlternarVisibilidade}
                        aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                        {senhaVisivel ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>
                <ul className="requisitos-senha">
                    {requisitosSenha.map((requisito) => {
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
                <label> Confirmar Senha: </label>
                <input name="confirmacao" type="password" value={form.confirmacao} onChange={onChange} />
            </div>
        </form>
    )
}
