export default function UsuarioForm({ form, onChange, onSubmit }) {
    return (
        <form id="usuario-form" className="formulario" onSubmit={onSubmit}>
            <div className="campos">
                <label> Nome de Usuário: </label>
                <input name="nome" type="text" value={form.nome} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Email: </label>
                <input name="email" type="email" value={form.email} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Telefone: </label>
                <input name="telefone" type="tel" inputMode="numeric" maxLength={15} autoComplete="tel" placeholder="(11) 99999-9999" value={form.telefone} onChange={onChange} />
            </div>

            <button type="submit" className="botao-enviar">
                Salvar
            </button>
        </form>
    )
}
