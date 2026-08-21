import './CadastroForm.css'

export default function CadastroForm({ form, onChange, onSubmit }) {
    return (
        <form id="register-form" className="formulario" onSubmit={onSubmit}>
            <div className="campos">
                <label> Nome de Usuário: </label>
                <input name="nome" value={form.nome} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Email: </label>
                <input name="email" type="email" value={form.email} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Senha: </label>
                <input name="senha" type="password" value={form.senha} onChange={onChange} />
            </div>
            
            <div className="campos">
                <label> Confirmar Senha: </label>
                <input name="confirmacao" type="password" value={form.confirmacao} onChange={onChange} />
            </div>
        </form>
    )
}
