import './CadastroForm.css'

export default function CadastroForm({ form, onChange, onSubmit }) {
    return (
        <form id="register-form" className="formulario" onSubmit={onSubmit}>
            <div className="campos">
                <label> Nome de Usuário: </label>
                <input name="username" value={form.username} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Email: </label>
                <input name="email" type="email" value={form.email} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Senha: </label>
                <input name="password" type="password" value={form.password} onChange={onChange} />
            </div>
            
            <div className="campos">
                <label> Confirmar Senha: </label>
                <input name="confirm" type="password" value={form.confirm} onChange={onChange} />
            </div>
        </form>
    )
}
